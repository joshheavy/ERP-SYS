import React from 'react';

/**
 * Client-side export helpers — no external dependency.
 *
 *  - CSV: builds a UTF-8 CSV (with BOM so Excel opens it cleanly) and triggers a
 *    download. This is the pragmatic "Export to Excel" for a prototype: .csv
 *    opens directly in Excel/Sheets without shipping a heavy xlsx encoder.
 *  - PDF: opens a print-ready window scoped to the table; the user picks
 *    "Save as PDF" in the browser print dialog.
 *
 * When a real backend/export service lands, these can be swapped for a
 * server-generated xlsx/pdf without touching call sites.
 */

/** Recursively pull readable text out of a React node (for cell renderers). */
export function extractText(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join(' ');
  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode };
    return extractText(props?.children);
  }
  return '';
}

function csvCell(value: string): string {
  const v = value.replace(/\r?\n/g, ' ').trim();
  // Quote if it contains a comma, quote or leading/trailing space.
  if (/[",]/.test(v) || v !== value.trim()) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

function timestamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'export';
}

export interface ExportColumn {
  header: string;
  value: (rowIndex: number) => string;
}

/** Download rows as a CSV file. `title` seeds the filename. */
export function exportToCsv(title: string, headers: string[], rows: string[][]): void {
  const bom = '\uFEFF';
  const lines = [headers.map(csvCell).join(','), ...rows.map((r) => r.map(csvCell).join(','))];
  const blob = new Blob([bom + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slug(title)}-${timestamp()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Open a print-ready window (user chooses "Save as PDF"). */
export function exportToPdf(title: string, headers: string[], rows: string[][]): void {
  const w = window.open('', '_blank', 'width=1024,height=768');
  if (!w) return;
  const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] as string));
  const thead = `<tr>${headers.map((h) => `<th>${esc(h)}</th>`).join('')}</tr>`;
  const tbody = rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('');
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title>
    <style>
      body{font-family:Inter,system-ui,sans-serif;color:#0f172a;padding:24px;}
      h1{font-size:18px;margin:0 0 4px;}
      .meta{color:#64748b;font-size:12px;margin-bottom:16px;}
      table{border-collapse:collapse;width:100%;font-size:12px;}
      th,td{border:1px solid #e2e7ef;padding:6px 8px;text-align:left;}
      th{background:#f7f9fc;font-weight:600;text-transform:uppercase;font-size:10px;letter-spacing:.04em;color:#4f5e70;}
      tr:nth-child(even) td{background:#f7f9fc;}
      @media print{body{padding:0;}}
    </style></head><body>
    <h1>${esc(title)}</h1>
    <div class="meta">${rows.length} rows · generated ${new Date().toLocaleString('en-KE')}</div>
    <table><thead>${thead}</thead><tbody>${tbody}</tbody></table>
    <script>window.onload=function(){setTimeout(function(){window.print();},200);};</script>
    </body></html>`);
  w.document.close();
}
