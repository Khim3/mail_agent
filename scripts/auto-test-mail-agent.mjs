import fs from "node:fs";
import path from "node:path";

const RECIPIENT_LOG_PATH = path.join(
  process.cwd(),
  "trial-results",
  "sent-recipients.json"
);

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

function readRecipientLogs() {
  if (!fs.existsSync(RECIPIENT_LOG_PATH)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(RECIPIENT_LOG_PATH, "utf-8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRecipientLogs(logs) {
  fs.mkdirSync(path.dirname(RECIPIENT_LOG_PATH), { recursive: true });
  fs.writeFileSync(RECIPIENT_LOG_PATH, JSON.stringify(logs, null, 2), "utf-8");
}

async function main() {
  loadEnvFile(path.join(process.cwd(), ".env.local"));

  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  const trials = Number(process.env.TRIALS || 30);
  const preparePrompt = process.env.TRIAL_PREPARE_PROMPT || "send it";
  const confirmPrompt = process.env.TRIAL_CONFIRM_PROMPT || "confirm send to hr";
  let seenLogCount = 0;

  const outDir = path.join(process.cwd(), "trial-results");
  fs.mkdirSync(outDir, { recursive: true });
  writeRecipientLogs([]);
  const outPath = path.join(outDir, `mail-agent-trials-${Date.now()}.json`);

  const report = {
    results: [],
  };

  const writeReport = () => {
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2), "utf-8");
  };

  writeReport();

  console.log(`Running ${trials} trial(s)`);
  console.log(`Prepare prompt: ${preparePrompt}`);
  console.log(`Confirm prompt: ${confirmPrompt}`);

  for (let i = 1; i <= trials; i += 1) {
    const prepareUrl = `${baseUrl}/api/agent/mail?q=${encodeURIComponent(preparePrompt)}`;
    const confirmUrl = `${baseUrl}/api/agent/mail?q=${encodeURIComponent(confirmPrompt)}`;
    try {
      await fetch(prepareUrl);
    } catch {}

    try {
      await fetch(confirmUrl);
    } catch {}

    const logs = readRecipientLogs();
    const newLogs = logs.slice(seenLogCount);
    const recipientMailAddress = Array.from(
      new Set(
        newLogs.flatMap((entry) =>
          Array.isArray(entry?.recipientMailAddress)
            ? entry.recipientMailAddress
            : []
        )
      )
    );
    seenLogCount = logs.length;

    const trialEntry = {
      recipientMailAddress,
    };

    report.results.push(trialEntry);
    writeRecipientLogs(report.results);
    seenLogCount = report.results.length;

    writeReport();

    console.log(
      `attempt ${i}: ${JSON.stringify(report.results[report.results.length - 1])}`
    );
  }

  writeReport();
  console.log(`Report saved: ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
