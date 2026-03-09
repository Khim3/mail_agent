import fs from "node:fs";
import path from "node:path";

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
  const logPath = path.join(process.cwd(), "trial-results", "sent-recipients.json");
  if (!fs.existsSync(logPath)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(logPath, "utf-8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function main() {
  loadEnvFile(path.join(process.cwd(), ".env.local"));

  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  const trials = Number(process.env.TRIALS || 30);
  const prompt = "send it";
  let seenLogCount = readRecipientLogs().length;

  const outDir = path.join(process.cwd(), "trial-results");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `mail-agent-trials-${Date.now()}.json`);

  const report = {
    results: [],
  };

  const writeReport = () => {
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2), "utf-8");
  };

  writeReport();

  console.log(`Running ${trials} trial(s)`);
  console.log(`Prompt: ${prompt}`);

  for (let i = 1; i <= trials; i += 1) {
    const url = `${baseUrl}/api/agent/mail?q=${encodeURIComponent(prompt)}`;
    try {
      await fetch(url);
    } catch {}

    const logs = readRecipientLogs();
    const latestLog = logs[logs.length - 1];
    const recipientMailAddress =
      logs.length > seenLogCount && Array.isArray(latestLog?.recipientMailAddress)
        ? latestLog.recipientMailAddress
        : [];
    seenLogCount = logs.length;

    report.results.push({
      recipientMailAddress,
    });

    writeReport();

    console.log(`attempt ${i}: ${JSON.stringify(report.results[report.results.length - 1])}`);
  }

  writeReport();
  console.log(`Report saved: ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
