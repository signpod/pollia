/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import { EditorMissionActionBar } from "../EditorMissionActionBar";

jest.mock("@repo/ui/components", () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button type="button" onClick={onClick} disabled={Boolean(disabled)}>
      {children}
    </button>
  ),
}));

describe("EditorMissionActionBar", () => {
  it("저장하기 버튼이 노출된다", () => {
    render(
      <EditorMissionActionBar
        isSavingAll={false}
        hasAnyBusySection={false}
        hasAnyPendingChanges={true}
        hasAnyValidationIssues={false}
        canSave={true}
        onSave={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: "저장하기" })).not.toBeNull();
  });

  it("canSave가 false면 저장하기 버튼이 비활성화된다", () => {
    render(
      <EditorMissionActionBar
        isSavingAll={false}
        hasAnyBusySection={false}
        hasAnyPendingChanges={true}
        hasAnyValidationIssues={false}
        canSave={false}
        onSave={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: "저장하기" }).hasAttribute("disabled")).toBe(true);
  });

  it("변경사항이 없으면 저장하기 버튼이 비활성화된다", () => {
    render(
      <EditorMissionActionBar
        isSavingAll={false}
        hasAnyBusySection={false}
        hasAnyPendingChanges={false}
        hasAnyValidationIssues={false}
        canSave={true}
        onSave={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: "저장하기" }).hasAttribute("disabled")).toBe(true);
  });
});
