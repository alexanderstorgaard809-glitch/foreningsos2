export type ParsedMember = {
  name: string;
  address: string;
  email: string | null;
  phone: string | null;
};

export type ParseResult = {
  members: ParsedMember[];
  errors: string[];
};

function clean(value: string | undefined): string {
  return (value ?? "").trim();
}

export function parseMembers(text: string): ParseResult {
  const members: ParsedMember[] = [];
  const errors: string[] = [];

  const lines = text.split(/\r?\n/);

  lines.forEach((line, index) => {
    const raw = line.trim();
    if (!raw) return;

    const lower = raw.toLowerCase();

    // Skip header rows like "Name", "Navn", "Name;Address;Email"
    const isSingleHeader = /^(name|navn|full name|member|medlem)s?$/.test(lower);
    const isCombinedHeader =
      /^(name|navn)\b/.test(lower) &&
      /(address|adresse|email|mail|phone|telefon|tlf)/.test(lower);
    if (isSingleHeader || isCombinedHeader) return;

    if (raw.includes("\t") || raw.includes(";")) {
      // Direct paste from Excel/Sheets (tabs) or semicolon CSV — precise columns
      const parts = raw.includes("\t") ? raw.split("\t") : raw.split(";");
      const name = clean(parts[0]);
      const address = clean(parts[1]);
      const email = clean(parts[2]) || null;
      const phone = clean(parts[3]) || null;

      if (!name) {
        errors.push(`Line ${index + 1}: no name found`);
        return;
      }
      members.push({ name, address, email, phone });
    } else if (raw.includes(",")) {
      // Typed line like "Jane Jensen, Fællesvej 3, 8000 Aarhus" —
      // everything after the first comma is the address (postal codes contain commas)
      const commaIndex = raw.indexOf(",");
      const name = clean(raw.slice(0, commaIndex));
      const address = clean(raw.slice(commaIndex + 1));

      if (!name) {
        errors.push(`Line ${index + 1}: no name found`);
        return;
      }
      members.push({ name, address, email: null, phone: null });
    } else {
      // Just a name on its own line — imported, address can be added later
      members.push({ name: raw, address: "", email: null, phone: null });
    }
  });

  return { members, errors };
}
