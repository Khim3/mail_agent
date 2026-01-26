export function cleanEmailText(raw: string): string {
  if (!raw) return "";

  return raw
    .replace(/\r/g, "")
    .replace(/<https?:\/\/[^>]+>/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\[image:[^\]]+\]/gi, "")
    .replace(/\n{2,}/g, "\n")
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .join("\n");
}
