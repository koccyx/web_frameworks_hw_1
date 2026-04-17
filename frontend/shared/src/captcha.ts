export function generateCaptcha() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const text = Array.from({ length: 5 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  const chars = text
    .split("")
    .map((char, index) => {
      const x = 16 + index * 28;
      const y = 38;
      return `<text x="${x}" y="${y}" fill="#1f2937" font-size="30" font-family="monospace" font-weight="700">${char}</text>`;
    })
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="60" viewBox="0 0 160 60"><rect width="160" height="60" fill="#f8fafc"/>${chars}</svg>`;

  return {
    expected: text,
    image: `data:image/svg+xml;base64,${btoa(svg)}`,
  };
}
