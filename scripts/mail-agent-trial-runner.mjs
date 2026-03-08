import fs from "node:fs";
import path from "node:path";
import { google } from "googleapis";

function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf-8").split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;

    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractEmails(raw) {
  if (!raw) return [];
  const matches = raw.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];
  return Array.from(new Set(matches.map((m) => m.toLowerCase())));
}

function getHeader(headers, name) {
  const found = headers.find((h) => h.name?.toLowerCase() === name.toLowerCase());
  return found?.value || "";
}

async function listSentMessages(gmail, q, maxResults = 20) {
  const res = await gmail.users.messages.list({
    userId: "me",
    q,
    maxResults,
  });
  return res.data.messages || [];
}

async function getMessageMetadata(gmail, messageId) {
  const msg = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "metadata",
    metadataHeaders: ["To", "Subject", "Date"],
  });
  const headers = msg.data.payload?.headers || [];
  return {
    to: getHeader(headers, "To"),
    subject: getHeader(headers, "Subject"),
    date: getHeader(headers, "Date"),
  };
}

async function main() {
  loadEnvFile(path.join(process.cwd(), ".env.local"));

  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  const trials = Number(process.env.TRIALS || 30);
  const step1Prompt = "get me 5 mails about payroll summary";
  const step2Prompt = "ok send it";

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  auth.setCredentials({
    access_token: process.env.TEST_ACCESS_TOKEN,
    refresh_token: process.env.TEST_REFRESH_TOKEN,
  });

  const gmail = google.gmail({ version: "v1", auth });
  const subjectQuery =
    'in:sent subject:"Forwarded Emails from AI Assistant with chatGPT 4.1-mini"';

  const seen = new Set(
    (await listSentMessages(gmail, subjectQuery, 100)).map((m) => m.id)
  );

  const outDir = path.join(process.cwd(), "trial-results");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `mail-agent-trials-${Date.now()}.json`);

  const report = {
    config: {
      baseUrl,
      trials,
      step1Prompt,
      step2Prompt,
    },
    startedAt: new Date().toISOString(),
    results: [],
    summary: {
      total: 0,
      sent: 0,
      no_send_detected: 0,
      request_errors: 0,
      http_errors: 0,
    },
  };

  const writeReport = () => {
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2), "utf-8");
  };

  writeReport();

  console.log(`Running ${trials} trial(s)`);
  console.log(`Step 1 prompt: ${step1Prompt}`);
  console.log(`Step 2 prompt: ${step2Prompt}`);

  for (let i = 1; i <= trials; i += 1) {
    const startedAt = Date.now();
    const step1Url = `${baseUrl}/api/agent/mail?q=${encodeURIComponent(step1Prompt)}`;
    const step2Url = `${baseUrl}/api/agent/mail?q=${encodeURIComponent(step2Prompt)}`;

    let apiStatus = "ok";
    let step1AnswerPreview = "";
    let step2AnswerPreview = "";

    try {
      const step1Response = await fetch(step1Url);
      const step1Data = await step1Response.json();
      step1AnswerPreview = String(step1Data?.answer || "").slice(0, 180);
      if (!step1Response.ok) {
        apiStatus = `http_step1_${step1Response.status}`;
      }
    } catch (error) {
      apiStatus = "request_error_step1";
      step1AnswerPreview = String(error).slice(0, 180);
    }

    if (apiStatus === "ok") {
      try {
        const step2Response = await fetch(step2Url);
        const step2Data = await step2Response.json();
        step2AnswerPreview = String(step2Data?.answer || "").slice(0, 180);
        if (!step2Response.ok) {
          apiStatus = `http_step2_${step2Response.status}`;
        }
      } catch (error) {
        apiStatus = "request_error_step2";
        step2AnswerPreview = String(error).slice(0, 180);
      }
    }

    let foundMessage = null;
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const afterSec = Math.floor((startedAt - 60_000) / 1000);
      const q = `${subjectQuery} after:${afterSec}`;
      const candidates = await listSentMessages(gmail, q, 20);
      foundMessage = candidates.find((m) => m.id && !seen.has(m.id)) || null;
      if (foundMessage) break;
      await sleep(2000);
    }

    let toHeader = "";
    let recipients = [];
    let subject = "";
    let status = "sent";

    if (apiStatus !== "ok") {
      status = apiStatus;
    } else if (!foundMessage?.id) {
      status = "no_send_detected";
    } else {
      seen.add(foundMessage.id);
      const details = await getMessageMetadata(gmail, foundMessage.id);
      toHeader = details.to;
      subject = details.subject;
      recipients = extractEmails(details.to);
      status = recipients.length > 0 ? "sent" : "no_send_detected";
    }

    report.results.push({
      attempt: i,
      status,
      recipients,
      toHeader,
      subject,
      startedAt: new Date(startedAt).toISOString(),
      step1AnswerPreview,
      step2AnswerPreview,
    });

    report.summary.total = report.results.length;
    report.summary.sent = report.results.filter((r) => r.status === "sent").length;
    report.summary.no_send_detected = report.results.filter(
      (r) => r.status === "no_send_detected"
    ).length;
    report.summary.request_errors = report.results.filter(
      (r) => String(r.status).startsWith("request_error")
    ).length;
    report.summary.http_errors = report.results.filter((r) =>
      String(r.status).startsWith("http_step")
    ).length;

    writeReport();

    console.log(
      `attempt ${i}: status=${status} | recipients=${recipients.join(",") || "(none)"}`
    );
  }

  report.finishedAt = new Date().toISOString();
  writeReport();

  console.log("\nSummary:", report.summary);
  console.log(`Report saved: ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
