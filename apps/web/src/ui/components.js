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
  <section class="bg-white border border-slate-200/80 rounded-2xl shadow-sm shadow-slate-200/60 overflow-hidden">
    <div class="p-4 md:p-5 border-b border-slate-100 relative">
      <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500"></div>
      <h2 class="font-semibold text-base md:text-lg">${title}</h2>
    </div>
    <div class="p-4 md:p-5">${bodyHtml}</div>
    ${footerHtml ? `<div class="p-4 md:p-5 border-t border-slate-100">${footerHtml}</div>` : ""}
  </section>`;
}

export function pill(text) {
  return `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-indigo-50 text-indigo-700 border border-indigo-100">${escapeHtml(text)}</span>`;
}

export function alertBox(type, text) {
  const map = {
    info: "bg-sky-50 border-sky-200 text-sky-900",
    warn: "bg-amber-50 border-amber-200 text-amber-900",
    error: "bg-rose-50 border-rose-200 text-rose-900",
    ok: "bg-emerald-50 border-emerald-200 text-emerald-900",
  };
  return `<div class="border rounded-xl p-3 text-sm ${map[type] || map.info}">${escapeHtml(text)}</div>`;
}
