export function cleanEmailText(raw: string): string {
  if (!raw) return "";

  return raw
    .replace(/\r/g, "")                           // remove CR
    .replace(/<https?:\/\/[^>]+>/g, "")           // remove <http://...>
    .replace(/https?:\/\/\S+/g, "")               // remove bare links
    .replace(/\[image:[^\]]+\]/gi, "")            // remove image refs
    .replace(/[ \t]+/g, " ")                      // collapse spaces
    .replace(/\n{2,}/g, "\n")                     // collapse multiple newlines
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .join("\n");
}
