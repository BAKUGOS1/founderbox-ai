import type { MigrationJob, PMDocument, QAReport } from "@/types";
import { strToU8, zipSync } from "fflate";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function copyText(value: string) {
  return navigator.clipboard.writeText(value);
}

export function pmDocumentToMarkdown(doc: PMDocument) {
  return [
    `# ${doc.title}`,
    "",
    `Generated: ${new Date(doc.createdAt).toLocaleString()}`,
    "",
    ...doc.sections.flatMap((section) => [
      `## ${section.title}`,
      "",
      section.content,
      ""
    ])
  ].join("\n");
}

export function qaReportToMarkdown(report: QAReport) {
  return [
    `# ${report.title}`,
    "",
    `URL: ${report.url}`,
    `Report type: ${report.reportType}`,
    "",
    report.summary,
    "",
    "## Issues",
    "",
    ...report.issues.map(
      (issue) =>
        `- **${issue.priority}** ${issue.module}: ${issue.issue} (${issue.status}) - ${issue.description}`
    )
  ].join("\n");
}

export function downloadText(filename: string, text: string, type = "text/plain") {
  downloadBlob(new Blob([text], { type }), filename);
}

export function downloadJson(filename: string, value: unknown) {
  downloadText(filename, JSON.stringify(value, null, 2), "application/json");
}

function xmlEscape(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function columnName(index: number) {
  let name = "";
  let current = index + 1;
  while (current > 0) {
    const remainder = (current - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    current = Math.floor((current - 1) / 26);
  }
  return name;
}

type WorkbookRow = object;

function normalizeRows(rows: WorkbookRow[]) {
  const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  return [
    headers,
    ...rows.map((row) =>
      headers.map((header) => (row as Record<string, unknown>)[header] ?? "")
    )
  ];
}

function sheetXml(rows: unknown[][]) {
  const renderedRows = rows
    .map((row, rowIndex) => {
      const cells = row
        .map((value, columnIndex) => {
          const cellRef = `${columnName(columnIndex)}${rowIndex + 1}`;
          const numeric =
            typeof value === "number" ||
            (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value)));
          if (numeric) {
            return `<c r="${cellRef}"><v>${xmlEscape(value)}</v></c>`;
          }
          return `<c r="${cellRef}" t="inlineStr"><is><t>${xmlEscape(value)}</t></is></c>`;
        })
        .join("");
      return `<row r="${rowIndex + 1}">${cells}</row>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${renderedRows}</sheetData></worksheet>`;
}

function safeSheetName(name: string, index: number) {
  const cleaned = name.replace(/[\\/?*[\]:]/g, " ").slice(0, 28).trim();
  return cleaned ? cleaned : `Sheet ${index + 1}`;
}

function downloadWorkbook(
  filename: string,
  sheets: Array<{ name: string; rows: WorkbookRow[] }>
) {
  const sheetFiles = sheets.map((sheet, index) => ({
    name: safeSheetName(sheet.name, index),
    xml: sheetXml(normalizeRows(sheet.rows.length ? sheet.rows : [{ Empty: "No rows" }]))
  }));

  const workbookSheets = sheetFiles
    .map(
      (sheet, index) =>
        `<sheet name="${xmlEscape(sheet.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`
    )
    .join("");
  const rels = sheetFiles
    .map(
      (_sheet, index) =>
        `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`
    )
    .join("");
  const contentTypes = sheetFiles
    .map(
      (_sheet, index) =>
        `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
    )
    .join("");

  const files: Record<string, Uint8Array> = {
    "[Content_Types].xml": strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
${contentTypes}
</Types>`),
    "_rels/.rels": strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`),
    "xl/workbook.xml": strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${workbookSheets}</sheets></workbook>`),
    "xl/_rels/workbook.xml.rels": strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rels}<Relationship Id="rId${sheetFiles.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`),
    "xl/styles.xml": strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="1"><font><sz val="11"/><name val="Inter"/></font></fonts><fills count="1"><fill><patternFill patternType="none"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="1"><xf/></cellXfs></styleSheet>`)
  };

  sheetFiles.forEach((sheet, index) => {
    files[`xl/worksheets/sheet${index + 1}.xml`] = strToU8(sheet.xml);
  });

  downloadBlob(
    new Blob([zipSync(files)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    }),
    filename
  );
}

export async function downloadQAExcel(report: QAReport) {
  downloadWorkbook(`${report.title.replace(/[^a-z0-9]+/gi, "-")}.xlsx`, [
    {
      name: "Summary",
      rows: [
        {
          Title: report.title,
          URL: report.url,
          Type: report.reportType,
          Issues: report.issues.length,
          Generated: report.createdAt
        }
      ]
    },
    { name: "Issues", rows: report.issues },
    {
      name: "Test Steps",
      rows: report.steps.map((step, index) => ({ Step: index + 1, Name: step }))
    },
    {
      name: "Screenshots",
      rows: [
        {
          Name: "login-page.png",
          Status: "Simulated screenshot placeholder",
          Note: "Frontend demo does not run browser automation."
        },
        {
          Name: "dashboard-mobile.png",
          Status: "Simulated screenshot placeholder",
          Note: "Real screenshots will be generated by backend workers."
        }
      ]
    }
  ]);
}

export async function downloadMigrationExcel(job: MigrationJob, kind: "final" | "errors") {
  downloadWorkbook(
    `${job.title.replace(/[^a-z0-9]+/gi, "-")}-${kind === "final" ? "final" : "errors"}.xlsx`,
    [
      {
        name: kind === "final" ? "Final Import" : "Validation Errors",
        rows: kind === "final" ? job.previewRows : job.validationErrors
      }
    ]
  );
}
