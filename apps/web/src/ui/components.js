export function cls(...xs) {
  return xs.filter(Boolean).join(" ");
}

export function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function card(title, bodyHtml, footerHtml = "") {
  return `
  <section class="fortune-card">
    <div class="fortune-card-header">
      <h2 class="fortune-card-title">${title}</h2>
    </div>
    <div class="fortune-card-body">${bodyHtml}</div>
    ${footerHtml ? `<div class="fortune-card-footer">${footerHtml}</div>` : ""}
  </section>`;
}

export function pill(text) {
  return `<span class="fortune-pill">${escapeHtml(text)}</span>`;
}

export function alertBox(type, text) {
  const map = {
    info: "bg-sky-50 border-sky-200 text-sky-900",
    warn: "bg-amber-50 border-amber-200 text-amber-900",
    error: "bg-rose-50 border-rose-200 text-rose-900",
    ok: "bg-emerald-50 border-emerald-200 text-emerald-900",
  };
  return `<div class="fortune-alert border ${map[type] || map.info}">${escapeHtml(text)}</div>`;
}
