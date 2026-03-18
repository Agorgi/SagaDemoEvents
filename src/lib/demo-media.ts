function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function toDataUri(svg: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function createAvatarDataUri(
  name: string,
  accent = "#1F1CB8",
  secondary = "#5E8BFF"
) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240" fill="none">
      <rect width="240" height="240" rx="120" fill="#0B0D12"/>
      <rect x="12" y="12" width="216" height="216" rx="108" fill="url(#bg)"/>
      <circle cx="120" cy="92" r="42" fill="rgba(255,255,255,0.16)"/>
      <path d="M58 198c10-34 35-54 62-54 26 0 51 20 62 54" fill="rgba(255,255,255,0.18)"/>
      <text x="120" y="128" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="54" font-weight="700" fill="white">${escapeXml(initials)}</text>
      <defs>
        <linearGradient id="bg" x1="22" y1="18" x2="208" y2="222" gradientUnits="userSpaceOnUse">
          <stop stop-color="${accent}"/>
          <stop offset="1" stop-color="${secondary}"/>
        </linearGradient>
      </defs>
    </svg>
  `.trim();

  return toDataUri(svg);
}

export function createPosterDataUri({
  title,
  subtitle,
  eyebrow,
  accent = "#1F1CB8",
  accent2 = "#4D8CFF"
}: {
  title: string;
  subtitle: string;
  eyebrow: string;
  accent?: string;
  accent2?: string;
}) {
  const titleLines = title
    .split(/\s+/)
    .reduce<string[]>((lines, word) => {
      const current = lines[lines.length - 1] ?? "";
      if (`${current} ${word}`.trim().length > 14) {
        lines.push(word);
      } else if (lines.length === 0) {
        lines.push(word);
      } else {
        lines[lines.length - 1] = `${current} ${word}`.trim();
      }
      return lines;
    }, [])
    .slice(0, 3);

  const titleMarkup = titleLines
    .map(
      (line, index) => `
        <text x="44" y="${182 + index * 54}" font-family="Inter, Arial, sans-serif" font-size="46" font-weight="800" fill="white">
          ${escapeXml(line)}
        </text>
      `
    )
    .join("");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="960" height="1280" viewBox="0 0 960 1280" fill="none">
      <rect width="960" height="1280" rx="44" fill="#070A10"/>
      <rect width="960" height="1280" rx="44" fill="url(#panel)"/>
      <circle cx="778" cy="232" r="280" fill="${accent}" fill-opacity="0.22"/>
      <circle cx="192" cy="1038" r="246" fill="${accent2}" fill-opacity="0.18"/>
      <rect x="36" y="36" width="888" height="1208" rx="34" stroke="rgba(255,255,255,0.12)"/>
      <rect x="44" y="52" width="236" height="42" rx="21" fill="rgba(255,255,255,0.08)"/>
      <text x="68" y="80" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="700" fill="white" letter-spacing="2">
        ${escapeXml(eyebrow.toUpperCase())}
      </text>
      <rect x="44" y="116" width="872" height="520" rx="28" fill="rgba(5,8,16,0.72)" stroke="rgba(255,255,255,0.08)"/>
      <rect x="72" y="148" width="262" height="456" rx="24" fill="url(#photoPanel)"/>
      <rect x="360" y="148" width="528" height="122" rx="24" fill="${accent}" fill-opacity="0.14"/>
      ${titleMarkup}
      <text x="44" y="392" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="500" fill="rgba(255,255,255,0.72)">
        ${escapeXml(subtitle)}
      </text>
      <rect x="44" y="1036" width="304" height="164" rx="28" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.08)"/>
      <text x="76" y="1104" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="700" fill="white">
        Saga Demo
      </text>
      <text x="76" y="1142" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="500" fill="rgba(255,255,255,0.68)">
        Community-built
      </text>
      <text x="76" y="1178" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="500" fill="rgba(255,255,255,0.68)">
        Production-ready
      </text>
      <rect x="652" y="1036" width="236" height="164" rx="28" fill="${accent}" fill-opacity="0.16" stroke="rgba(255,255,255,0.12)"/>
      <text x="690" y="1112" font-family="Inter, Arial, sans-serif" font-size="46" font-weight="800" fill="white">
        SAGA
      </text>
      <text x="690" y="1162" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="500" fill="rgba(255,255,255,0.7)">
        fandom infrastructure
      </text>
      <defs>
        <linearGradient id="panel" x1="36" y1="24" x2="916" y2="1244" gradientUnits="userSpaceOnUse">
          <stop stop-color="#12182B"/>
          <stop offset="0.48" stop-color="#0C1020"/>
          <stop offset="1" stop-color="#070A10"/>
        </linearGradient>
        <linearGradient id="photoPanel" x1="72" y1="148" x2="334" y2="604" gradientUnits="userSpaceOnUse">
          <stop stop-color="${accent}" stop-opacity="0.92"/>
          <stop offset="1" stop-color="${accent2}" stop-opacity="0.3"/>
        </linearGradient>
      </defs>
    </svg>
  `.trim();

  return toDataUri(svg);
}

export function createStoryCardDataUri({
  title,
  excerpt,
  accent = "#1F1CB8",
  accent2 = "#9A70FF"
}: {
  title: string;
  excerpt: string;
  accent?: string;
  accent2?: string;
}) {
  const lines = excerpt
    .split(/\s+/)
    .reduce<string[]>((acc, word) => {
      const next = `${acc[acc.length - 1] ?? ""} ${word}`.trim();
      if (!acc.length || next.length > 44) {
        acc.push(word);
      } else {
        acc[acc.length - 1] = next;
      }
      return acc;
    }, [])
    .slice(0, 4);

  const lineMarkup = lines
    .map(
      (line, index) => `
        <text x="78" y="${360 + index * 72}" font-family="Georgia, Times New Roman, serif" font-size="46" font-weight="500" fill="rgba(255,255,255,0.84)">
          ${escapeXml(line)}
        </text>
      `
    )
    .join("");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" fill="none">
      <rect width="1600" height="900" rx="36" fill="#090C13"/>
      <rect width="1600" height="900" rx="36" fill="url(#bg)"/>
      <circle cx="1260" cy="190" r="320" fill="${accent}" fill-opacity="0.28"/>
      <circle cx="350" cy="770" r="300" fill="${accent2}" fill-opacity="0.18"/>
      <rect x="40" y="40" width="1520" height="820" rx="28" stroke="rgba(255,255,255,0.09)"/>
      <text x="78" y="130" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="700" fill="rgba(255,255,255,0.72)" letter-spacing="2">SAGA FICTION DROP</text>
      <text x="78" y="248" font-family="Georgia, Times New Roman, serif" font-size="86" font-weight="700" fill="white">${escapeXml(title)}</text>
      ${lineMarkup}
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1600" y2="900" gradientUnits="userSpaceOnUse">
          <stop stop-color="#12172A"/>
          <stop offset="1" stop-color="#090C13"/>
        </linearGradient>
      </defs>
    </svg>
  `.trim();

  return toDataUri(svg);
}
