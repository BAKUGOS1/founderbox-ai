import type { ValidationError } from "@/types";

export const sampleSourceColumns = [
  "Party Name",
  "Mob",
  "GST No",
  "Balance",
  "Email",
  "Address",
  "City",
  "State"
];

export const sampleSourceRows: Record<string, string | number>[] = [
  {
    "Party Name": "Ahuja Decorators",
    Mob: "9811122233",
    "GST No": "07ABCDE1234F1Z5",
    Balance: 24000,
    Email: "accounts@ahuja.example",
    Address: "Delhi"
  },
  {
    "Party Name": "Mehta Caterers",
    Mob: "9988776655",
    "GST No": "27ABCDE1234F1Z2",
    Balance: 17500,
    Email: "billing@mehta.example",
    Address: "Mumbai"
  },
  {
    "Party Name": "Ahuja Decorators",
    Mob: "98111AB233",
    "GST No": "07ABCDE1234F1Z",
    Balance: "12,400",
    Email: "finance.ahuja.example",
    Address: "Delhi"
  }
];

export function validateMigrationRows(
  rows: Record<string, string | number>[]
): ValidationError[] {
  const errors: ValidationError[] = [];
  const ledgerNames = new Map<string, number>();

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const ledger = String(row["Ledger Name"] ?? row["Party Name"] ?? "").trim();
    const mobile = String(row["Mobile Number"] ?? row.Mob ?? "").trim();
    const gstin = String(row.GSTIN ?? row["GST No"] ?? "").trim();
    const balance = row["Opening Balance"] ?? row.Balance;
    const email = String(row.Email ?? "").trim();

    if (!ledger) {
      errors.push({
        id: `val-ledger-${rowNumber}`,
        row: rowNumber,
        field: "Ledger Name",
        issue: "Required ledger name is empty",
        suggestedFix: "Add the legal party or customer name",
        severity: "High"
      });
    } else if (ledgerNames.has(ledger.toLowerCase())) {
      errors.push({
        id: `val-duplicate-${rowNumber}`,
        row: rowNumber,
        field: "Ledger Name",
        issue: "Duplicate ledger name detected",
        suggestedFix: "Merge duplicate records or add a branch/location suffix",
        severity: "Medium"
      });
    }
    ledgerNames.set(ledger.toLowerCase(), rowNumber);

    if (mobile && !/^\d{10}$/.test(mobile)) {
      errors.push({
        id: `val-mobile-${rowNumber}`,
        row: rowNumber,
        field: "Mobile Number",
        issue: "Mobile number should be numeric and 10 digits",
        suggestedFix: "Remove spaces, country code, and alphabetic characters",
        severity: "High"
      });
    }

    if (gstin && gstin.length !== 15) {
      errors.push({
        id: `val-gstin-${rowNumber}`,
        row: rowNumber,
        field: "GSTIN",
        issue: "GSTIN should be 15 characters",
        suggestedFix: "Ask the finance owner to confirm the legal GSTIN",
        severity: "Medium"
      });
    }

    if (balance !== undefined && Number.isNaN(Number(String(balance).replace(/,/g, "")))) {
      errors.push({
        id: `val-balance-${rowNumber}`,
        row: rowNumber,
        field: "Opening Balance",
        issue: "Opening balance should be numeric",
        suggestedFix: "Remove symbols and keep only a decimal number",
        severity: "Medium"
      });
    }

    if (email && !email.includes("@")) {
      errors.push({
        id: `val-email-${rowNumber}`,
        row: rowNumber,
        field: "Email",
        issue: "Email should contain @ if present",
        suggestedFix: "Fix the email or leave it blank for manual follow-up",
        severity: "Low"
      });
    }
  });

  return errors;
}
