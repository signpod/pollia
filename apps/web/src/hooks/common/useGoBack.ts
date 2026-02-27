"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { setBackNavigation } from "./useNavigationDirection";

export function useGoBack() {
  const router = useRouter();

  return useCallback(() => {
    setBackNavigation();

    const el = document.querySelector<HTMLElement>("[data-page-transition]");
    const main = el?.closest("main");

    if (!el || !main) {
      router.back();
      return;
    }

    const elRect = el.getBoundingClientRect();
    const mainRect = main.getBoundingClientRect();

    const clone = el.cloneNode(true) as HTMLElement;
    clone.removeAttribute("data-page-transition");

    const wrapper = document.createElement("div");
    wrapper.style.cssText = `
      position: fixed;
      top: 0;
      left: ${mainRect.left}px;
      width: ${mainRect.width}px;
      height: 100%;
      overflow: hidden;
      z-index: 9999;
      pointer-events: none;
    `;

    clone.style.cssText = `
      position: absolute;
      top: ${elRect.top}px;
      left: 0;
      width: 100%;
      background: var(--color-background, white);
    `;

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    router.back();

    const anim = clone.animate(
      [
        { transform: "translate3d(0, 0, 0)", opacity: "1" },
        { transform: "translate3d(100%, 0, 0)", opacity: "0" },
      ],
      {
        duration: 300,
        easing: "cubic-bezier(0.32, 0.72, 0, 1)",
        fill: "forwards",
      },
    );

    const cleanup = () => wrapper.remove();
    anim.onfinish = cleanup;
    setTimeout(cleanup, 350);
  }, [router]);
}
