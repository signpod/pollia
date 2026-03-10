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
  it("미발행 상태에서는 발행하기만 노출한다", () => {
    render(
      <EditorMissionActionBar
        isPublished={false}
        isSavingAll={false}
        isPublishing={false}
        hasAnyBusySection={false}
        hasAnyPendingChanges={true}
        hasAnyValidationIssues={false}
        canSave={true}
        canPublish={true}
        onSave={() => {}}
        onPublish={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: "저장하기" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "발행하기" })).not.toBeNull();
  });

  it("발행 상태에서는 저장하기만 노출한다", () => {
    render(
      <EditorMissionActionBar
        isPublished
        isSavingAll={false}
        isPublishing={false}
        hasAnyBusySection={false}
        hasAnyPendingChanges={true}
        hasAnyValidationIssues={false}
        canSave={true}
        canPublish={true}
        onSave={() => {}}
        onPublish={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: "저장하기" })).not.toBeNull();
    expect(screen.queryByRole("button", { name: "발행하기" })).toBeNull();
  });

  it("발행하기 버튼 disabled 규칙을 지킨다", () => {
    render(
      <EditorMissionActionBar
        isPublished={false}
        isSavingAll={false}
        isPublishing={false}
        hasAnyBusySection={false}
        hasAnyPendingChanges={false}
        hasAnyValidationIssues={false}
        canSave={false}
        canPublish={false}
        onSave={() => {}}
        onPublish={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: "발행하기" }).hasAttribute("disabled")).toBe(true);
  });

  it("발행 상태에서 canSave가 false면 저장하기 버튼이 비활성화된다", () => {
    render(
      <EditorMissionActionBar
        isPublished
        isSavingAll={false}
        isPublishing={false}
        hasAnyBusySection={false}
        hasAnyPendingChanges={true}
        hasAnyValidationIssues={false}
        canSave={false}
        canPublish={true}
        onSave={() => {}}
        onPublish={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: "저장하기" }).hasAttribute("disabled")).toBe(true);
  });
});
