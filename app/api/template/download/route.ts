import * as XLSX from "xlsx";

const DATA_START = 11;
const DATA_END = 106;

export function GET() {
  const wb = XLSX.utils.book_new();
  // fullCalcOnLoad is supported at runtime but missing from the npm types
  wb.Workbook = {
    Views: [{ fullCalcOnLoad: true } as unknown as XLSX.WBView],
  };

  const year = new Date().getFullYear();

  // ---- Sheet 1: Dues Tracker ----
  const trackerRows: (string | number | null)[][] = [
    ["HOA Dues Tracker"],
    ["Association:", "Your HOA name here"],
    ["Year:", year],
    [],
    ["Total expected:"],
    ["Collected:"],
    ["Outstanding:"],
    ["% collected:"],
    [],
    ["Unit / Address", "Owner", "Email", "Phone", "Annual Due", "Status", "Date Paid", "Notes"],
    ["12 Maple St", "Jane Smith", "jane@example.com", "555-0101", 1200, "Paid", `${year}-01-15`, ""],
    ["14 Maple St", "John Miller", "john@example.com", "555-0102", 1200, "Paid", `${year}-02-03`, "Paid by check"],
    ["16 Maple St", "Emma Wilson", "", "", 1200, "Due", "", "Reminded"],
    ["18 Maple St", "Peter Larson", "", "", 1200, "Due", "", ""],
    ["20 Maple St", "Sarah Chen", "sarah@example.com", "555-0105", 1200, "Paid", `${year}-01-20`, ""],
    ["22 Maple St", "David Brown", "", "", 1200, "Due", "", ""],
  ];

  const tracker = XLSX.utils.aoa_to_sheet(trackerRows);

  // Live summary formulas (B5:B8), computed by Excel/Sheets on open
  tracker["B5"] = { t: "n", f: `SUM(E${DATA_START}:E${DATA_END})` };
  tracker["B6"] = {
    t: "n",
    f: `SUMIF(F${DATA_START}:F${DATA_END},"Paid",E${DATA_START}:E${DATA_END})`,
  };
  tracker["B7"] = { t: "n", f: "B5-B6" };
  tracker["B8"] = { t: "s", f: `TEXT(IFERROR(B6/B5,0),"0%")` };

  tracker["!cols"] = [
    { wch: 18 }, { wch: 16 }, { wch: 24 }, { wch: 14 },
    { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 24 },
  ];

  XLSX.utils.book_append_sheet(wb, tracker, "Dues Tracker");

  // ---- Sheet 2: How to use ----
  const howto = XLSX.utils.aoa_to_sheet([
    ["HOW TO USE THIS TEMPLATE"],
    [],
    ["GETTING STARTED"],
    ["1. Replace the example rows with your units. Add as many rows as you need."],
    ["2. In the Status column, type exactly Paid or Due — the summary formulas count on those words."],
    ["3. The summary at the top updates automatically: total expected, collected, outstanding, and % collected."],
    [],
    ["EVERY JANUARY (YEAR ROLLOVER)"],
    ["1. Right-click the 'Dues Tracker' tab > Move or Copy > check 'Create a copy'."],
    ["2. Rename the copy to the new year and update the Year cell at the top."],
    ["3. Clear the Status and Date Paid columns. Keep units, owners and the annual due amount."],
    [],
    ["LEDGER ON DEMAND"],
    ["When a homeowner, buyer or lawyer asks for a unit's payment history:"],
    ["- Keep one tab per year, and a unit's history is the same row across all tabs."],
    ["- Copy that unit's rows into an email, with dates and amounts. Takes two minutes."],
    [],
    ["TREASURER HANDOVER"],
    ["This file, plus the association bank statements, is the handover package."],
    ["Store it in the association's shared drive — not a personal account — so the"],
    ["next treasurer inherits records, not a mystery."],
    [],
    ["GOOGLE SHEETS"],
    ["File > Import > Upload this file. All formulas carry over."],
    [],
    ["WHEN THE SPREADSHEET BECOMES THE CHORE"],
    ["HOAcove does all of this automatically — per-unit ledgers, reminders, budgets,"],
    ["documents and more, stored with the association instead of one person."],
    ["Free for small boards: `https://hoacove.vercel.app`"],
  ]);

  howto["!cols"] = [{ wch: 100 }];
  XLSX.utils.book_append_sheet(wb, howto, "How to use");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="hoa-dues-tracker-template.xlsx"',
      "Content-Length": String(buf.length),
    },
  });
}
