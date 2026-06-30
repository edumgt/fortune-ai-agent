export function initOffcanvas() {
  const openBtn = document.querySelector("[data-oc-open]");
  const overlay = document.querySelector("[data-oc-overlay]");
  const panel = document.querySelector("[data-oc-panel]");
  const closeBtns = document.querySelectorAll("[data-oc-close]");

  if (!overlay || !panel) return;

  const open = () => {
    overlay.classList.remove("hidden");
    panel.classList.remove("-translate-x-full");
    document.body.classList.add("overflow-hidden");
  };

  const close = () => {
    overlay.classList.add("hidden");
    panel.classList.add("-translate-x-full");
    document.body.classList.remove("overflow-hidden");
  };

  openBtn?.addEventListener("click", open);
  overlay.addEventListener("click", close);
  closeBtns.forEach((b) => b.addEventListener("click", close));

  document.addEventListener("click", (e) => {
    const a = e.target?.closest?.("a.nav-link");
    if (!a) return;
    if (window.matchMedia("(max-width: 767px)").matches) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

export function initRightOffcanvas() {
  const openBtn = document.querySelector("[data-oc-right-open]");
  const overlay = document.querySelector("[data-oc-right-overlay]");
  const panel = document.querySelector("[data-oc-right-panel]");
  const closeBtns = document.querySelectorAll("[data-oc-right-close]");

  if (!overlay || !panel) return;

  const open = () => {
    overlay.classList.remove("hidden");
    panel.classList.remove("translate-x-full");
    document.body.classList.add("overflow-hidden");
  };

  const close = () => {
    overlay.classList.add("hidden");
    panel.classList.add("translate-x-full");
    document.body.classList.remove("overflow-hidden");
  };

  openBtn?.addEventListener("click", open);
  overlay.addEventListener("click", close);
  closeBtns.forEach((b) => b.addEventListener("click", close));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}
