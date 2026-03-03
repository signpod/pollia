/**
 * @jest-environment jsdom
 */

import { act, render, screen, waitFor } from "@testing-library/react";
import { EditorDesktopAbsolute } from "../desktop/EditorDesktopAbsolute";

function setWindowWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
}

describe("EditorDesktopAbsolute", () => {
  it("width < 1280에서는 렌더하지 않는다", async () => {
    setWindowWidth(1279);

    render(
      <EditorDesktopAbsolute side="left">
        <div>panel</div>
      </EditorDesktopAbsolute>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId("editor-desktop-absolute")).toBeNull();
    });
  });

  it("width >= 1280에서 렌더하고 좌우 좌표를 계산한다", async () => {
    setWindowWidth(1440);

    render(
      <>
        <EditorDesktopAbsolute side="left">
          <div>left</div>
        </EditorDesktopAbsolute>
        <EditorDesktopAbsolute side="right">
          <div>right</div>
        </EditorDesktopAbsolute>
      </>,
    );

    act(() => {
      window.dispatchEvent(new Event("resize"));
    });

    await waitFor(() => {
      expect(screen.getAllByTestId("editor-desktop-absolute")).toHaveLength(2);
    });

    const panels = screen.getAllByTestId("editor-desktop-absolute");
    const leftPanel = panels.find(panel => panel.getAttribute("data-side") === "left");
    const rightPanel = panels.find(panel => panel.getAttribute("data-side") === "right");
    expect(leftPanel).toBeTruthy();
    expect(rightPanel).toBeTruthy();

    if (!leftPanel || !rightPanel) {
      throw new Error("desktop panels were not rendered");
    }

    expect(leftPanel.getAttribute("data-side")).toBe("left");
    expect(leftPanel.style.left).toContain("50vw");
    expect(leftPanel.style.left).toContain("300px");
    expect(leftPanel.style.left).toContain("320px");
    expect(leftPanel.style.left).toContain("20px");
    expect(leftPanel.style.left).not.toContain("max(");
    expect(leftPanel.style.left).not.toContain("min(");
    expect(leftPanel.style.height).toBe("calc(100vh - 88px)");
    expect(leftPanel.style.overflow).toBe("hidden");
    expect(rightPanel.style.left).toMatch(/^calc\((50vw \+ 320px|320px \+ 50vw)\)$/);
  });
});
