// Minimal CSV parser handling quoted values and commas inside quotes.
export function parseCSV(text) {
  const rows = [];
  let row = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = false;
      } else cur += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cur); cur = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cur); cur = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
    } else cur += ch;
  }
  row.push(cur);
  if (row.some((c) => c.trim() !== "")) rows.push(row);
  return rows;
}

export const IMPORT_FIELDS = [
  { key: "email", label: "Email (required)" },
  { key: "firstName", label: "First name" },
  { key: "lastName", label: "Last name" },
  { key: "company", label: "Company" },
  { key: "phone", label: "Phone" },
  { key: "tags", label: "Tags (comma separated)" },
  { key: "source", label: "Source" },
];

// Guess a mapping from CSV header names to import fields
export function guessMapping(headers) {
  const mapping = {};
  const norm = (s) => s.toLowerCase().replace(/[^a-z]/g, "");
  headers.forEach((h, i) => {
    const n = norm(h);
    if (n.includes("email")) mapping.email = i;
    else if (n === "firstname" || n === "first" || n === "fname") mapping.firstName = i;
    else if (n === "lastname" || n === "last" || n === "lname") mapping.lastName = i;
    else if (n.includes("company") || n.includes("organization")) mapping.company = i;
    else if (n.includes("phone")) mapping.phone = i;
    else if (n.includes("tag")) mapping.tags = i;
    else if (n.includes("source")) mapping.source = i;
  });
  return mapping;
}