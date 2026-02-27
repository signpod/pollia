"use client";

let isBack = false;
let isBackPending = false;
let pendingSnapshot: HTMLElement | null = null;

if (typeof window !== "undefined") {
  const captureSnapshot = () => {
    const el = document.querySelector<HTMLElement>("[data-page-transition]");
    const main = el?.closest("main");
    if (!el || !main) return;

    const elRect = el.getBoundingClientRect();
    const mainRect = main.getBoundingClientRect();

    const clone = el.cloneNode(true) as HTMLElement;
    clone.removeAttribute("data-page-transition");
    clone.style.cssText = `
      position: fixed;
      top: ${elRect.top}px;
      left: ${mainRect.left}px;
      width: ${mainRect.width}px;
      pointer-events: none;
      opacity: 1;
      transform: none;
      z-index: 50;
    `;

    pendingSnapshot?.remove();
    pendingSnapshot = clone;
  };

  window.addEventListener("popstate", () => {
    isBack = true;
  });

  const originalPushState = history.pushState.bind(history);
  history.pushState = (...args: Parameters<typeof history.pushState>) => {
    if (!isBackPending) {
      captureSnapshot();
    }
    return originalPushState(...args);
  };
}

export function setBackNavigation() {
  isBack = true;
  isBackPending = true;
  setTimeout(() => {
    isBackPending = false;
  }, 500);
}

export function getIsBackNavigation() {
  const result = isBack;
  isBack = false;
  return result;
}

export function consumeSnapshot(): HTMLElement | null {
  const s = pendingSnapshot;
  pendingSnapshot = null;
  return s;
}
