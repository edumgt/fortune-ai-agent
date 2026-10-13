function syncScrollLock() {
  const isOpen = [...document.querySelectorAll("[data-oc-panel], [data-oc-right-panel]")]
    .some((panel) => panel.getAttribute("aria-hidden") === "false");
  document.body.classList.toggle("overflow-hidden", isOpen);
}

function initDrawer({ openSelector, overlaySelector, panelSelector, closeSelector, hiddenClass }) {
  const openBtn = document.querySelector(openSelector);
  const overlay = document.querySelector(overlaySelector);
  const panel = document.querySelector(panelSelector);
  const closeBtn = panel?.querySelector(closeSelector);
  if (!openBtn || !overlay || !panel) return;

  panel.inert = true;

  const close = (restoreFocus = true) => {
    if (panel.getAttribute("aria-hidden") === "true") return;
    overlay.classList.add("hidden");
    panel.classList.add(hiddenClass);
    panel.setAttribute("aria-hidden", "true");
    panel.inert = true;
    openBtn.setAttribute("aria-expanded", "false");
    syncScrollLock();
    if (restoreFocus) openBtn.focus();
  };

  const open = () => {
    overlay.classList.remove("hidden");
    panel.classList.remove(hiddenClass);
    panel.setAttribute("aria-hidden", "false");
    panel.inert = false;
    openBtn.setAttribute("aria-expanded", "true");
    syncScrollLock();
    closeBtn?.focus();
  };

  openBtn.addEventListener("click", () => {
    if (panel.getAttribute("aria-hidden") === "false") close();
    else open();
  });
  overlay.addEventListener("click", () => close());
  closeBtn?.addEventListener("click", () => close());
  panel.addEventListener("click", (event) => {
    if (event.target.closest("a[href]")) close(false);
  });
  document.addEventListener("keydown", (event) => {
    if (panel.getAttribute("aria-hidden") === "true") return;
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
    if (event.key !== "Tab") return;
    const focusable = [...panel.querySelectorAll("a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])")];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  window.addEventListener("hashchange", () => close(false));
}

export function initOffcanvas() {
  initDrawer({
    openSelector: "[data-oc-open]",
    overlaySelector: "[data-oc-overlay]",
    panelSelector: "[data-oc-panel]",
    closeSelector: "[data-oc-close]",
    hiddenClass: "-translate-x-full",
  });
}

export function initRightOffcanvas() {
  initDrawer({
    openSelector: "[data-oc-right-open]",
    overlaySelector: "[data-oc-right-overlay]",
    panelSelector: "[data-oc-right-panel]",
    closeSelector: "[data-oc-right-close]",
    hiddenClass: "translate-x-full",
  });
}
