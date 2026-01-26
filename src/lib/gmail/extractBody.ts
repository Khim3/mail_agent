function decodeBase64(data: string) {
  return Buffer.from(data, "base64").toString("utf-8");
}

export function extractEmailBody(payload: any): {
  text: string;
  html: string;
} {
  let text = "";
  let html = "";

  function walk(part: any) {
    if (!part) return;

    if (part.mimeType === "text/plain" && part.body?.data) {
      text += decodeBase64(part.body.data);
    }

    if (part.mimeType === "text/html" && part.body?.data) {
      html += decodeBase64(part.body.data);
    }

    if (part.parts) {
      for (const p of part.parts) {
        walk(p);
      }
    }
  }

  walk(payload);

  return { text, html };
}
