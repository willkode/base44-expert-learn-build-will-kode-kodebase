// Builds a clean, print-friendly HTML document for the Security Audit Report,
// and provides print + download helpers. Download uses a Blob so it works inside
// sandboxed preview iframes where window.open pop-ups are blocked.

function esc(s) {
  return String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}

// Build the full standalone HTML document for the report.
export function buildReportHtml(model, { autoPrint = false } = {}) {
  const sev = model.bySeverity;
  const issueRows = model.issues
    .map(
      (i) => `
      <div class="issue">
        <div class="issue-head"><span class="sev sev-${esc(i.severity).toLowerCase()}">${esc(i.severity)}</span> <strong>${esc(i.title)}</strong></div>
        <div class="meta">Category: ${esc(i.category)}${i.location ? " · Location: " + esc(i.location) : ""} · Status: ${esc(i.status)}</div>
        ${i.risk_summary ? `<div class="ln"><em>Risk:</em> ${esc(i.risk_summary)}</div>` : ""}
        ${i.recommended_fix ? `<div class="ln"><em>Recommended fix:</em> ${esc(i.recommended_fix)}</div>` : ""}
      </div>`
    )
    .join("");

  const fixOrder = model.fixOrder
    .map(
      (b, idx) =>
        `<li><strong>${idx + 1}. ${esc(b.label)}</strong> (${b.issues.length})<ul>${b.issues
          .map((i) => `<li>${esc(i.title)}</li>`)
          .join("")}</ul></li>`
    )
    .join("");

  const retest = model.retestItems.map((i) => `<li>&#9744; ${esc(i.title)} (${esc(i.severity)})</li>`).join("");

  const html = `<!doctype html><html><head><meta charset="utf-8" />
  <title>Security Audit Report</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color: #1a1a1a; max-width: 820px; margin: 32px auto; padding: 0 24px; line-height: 1.5; }
    h1 { font-size: 26px; margin: 0 0 4px; }
    h2 { font-size: 16px; border-bottom: 2px solid #eee; padding-bottom: 6px; margin: 26px 0 12px; }
    .muted { color: #666; font-size: 13px; }
    .score { font-size: 44px; font-weight: 800; }
    .label { display:inline-block; padding: 2px 10px; border-radius: 6px; background:#f1f1f1; font-weight:600; font-size:13px; }
    .grid { display:grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .cell { border:1px solid #e5e5e5; border-radius:8px; padding:10px; text-align:center; }
    .cell b { display:block; font-size:20px; }
    .issue { border:1px solid #e9e9e9; border-radius:8px; padding:10px 12px; margin-bottom:8px; page-break-inside: avoid; }
    .issue-head { font-size:14px; }
    .meta { color:#666; font-size:12px; margin:3px 0; }
    .ln { font-size:13px; margin:2px 0; }
    .sev { font-weight:700; font-size:11px; padding:1px 6px; border-radius:4px; color:#fff; }
    .sev-critical { background:#dc2626; } .sev-high { background:#ea580c; } .sev-medium { background:#d97706; } .sev-low { background:#2563eb; } .sev-info { background:#64748b; }
    .disclaimer { background:#f8f8f8; border-left:3px solid #999; padding:10px 12px; font-size:12px; color:#444; }
    ul { margin:6px 0; padding-left:20px; }
    @media print { body { margin: 0; } }
  </style></head>
  <body${autoPrint ? ' onload="window.print()"' : ""}>
    <h1>Security Audit Report</h1>
    <p class="muted">Generated ${esc(new Date().toLocaleString())}</p>

    <h2>Executive Summary</h2>
    <p class="muted">Scan Date: ${esc(model.scanDate)}</p>
    <div><span class="score">${model.score != null ? model.score : "—"}</span> <span class="muted">/ 100</span> &nbsp; <span class="label">${esc(model.label)}</span></div>
    <p>This report identifies likely access control, route protection, entity exposure, role permission, and user data isolation risks based on the app's configured security registry and scan results.</p>

    <h2>Scope Reviewed</h2>
    <div class="grid">
      <div class="cell"><b>${model.scope.routesReviewed}</b>Routes Reviewed</div>
      <div class="cell"><b>${model.scope.entitiesReviewed}</b>Entities Reviewed</div>
      <div class="cell"><b>${model.scope.rolesReviewed}</b>Roles Reviewed</div>
    </div>

    <h2>Issues by Severity</h2>
    <div class="grid">
      <div class="cell"><b>${sev.Critical || 0}</b>Critical</div>
      <div class="cell"><b>${sev.High || 0}</b>High</div>
      <div class="cell"><b>${sev.Medium || 0}</b>Medium</div>
    </div>
    <div class="grid" style="margin-top:10px;">
      <div class="cell"><b>${sev.Low || 0}</b>Low</div>
      <div class="cell"><b>${model.byStatus.fixed}</b>Fixed</div>
      <div class="cell"><b>${model.byStatus.open}</b>Open</div>
    </div>
    <div class="grid" style="margin-top:10px;">
      <div class="cell"><b>${model.byStatus.needsRetest}</b>Needs Retest</div>
    </div>

    ${fixOrder ? `<h2>Recommended Fix Order</h2><ol>${fixOrder}</ol>` : ""}

    ${issueRows ? `<h2>Issue Summaries</h2>${issueRows}` : ""}

    ${retest ? `<h2>Retest Checklist</h2><ul style="list-style:none;padding-left:0;">${retest}</ul>` : ""}

    <h2>Score Interpretation</h2>
    <ul>
      <li>90–100: Launch Ready</li>
      <li>75–89: Mostly Secure</li>
      <li>60–74: Needs Review</li>
      <li>40–59: High Risk</li>
      <li>0–39: Critical Risk</li>
    </ul>

    <h2>Final Notes</h2>
    <div class="disclaimer">This report is a practical app-level security review and does not replace a full third-party penetration test, infrastructure audit, legal compliance review, or enterprise security assessment.</div>
  </body></html>`;

  return html;
}

function reportFileName(model) {
  const d = new Date();
  const stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return `security-audit-report-${stamp}.html`;
}

// Download the report as a self-contained HTML file. Works inside sandboxed
// iframes (no pop-up needed). Returns true on success.
export function downloadReport(model) {
  try {
    const html = buildReportHtml(model, { autoPrint: false });
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = reportFileName(model);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch {
    return false;
  }
}

// Open a print-friendly window. May be blocked by pop-up blockers / sandboxed iframes.
export function printReport(model) {
  const html = buildReportHtml(model, { autoPrint: true });
  const w = window.open("", "_blank", "width=900,height=1000");
  if (!w) return false;
  w.document.open();
  w.document.write(html);
  w.document.close();
  return true;
}