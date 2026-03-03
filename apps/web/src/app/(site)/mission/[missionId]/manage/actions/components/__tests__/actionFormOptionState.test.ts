import { patchOptionByKey, removeOptionByKey } from "../actionFormOptionState";

interface OptionFixture {
  _key: string;
  id?: string;
  title: string;
  description?: string | null;
}

describe("actionFormOptionState", () => {
  it("B 삭제 후 A를 key 기반으로 수정해도 C에 영향이 없다", () => {
    const initial: OptionFixture[] = [
      { _key: "k-a", id: "a", title: "A" },
      { _key: "k-b", id: "b", title: "B" },
      { _key: "k-c", id: "c", title: "C" },
    ];

    const withoutB = removeOptionByKey(initial, "k-b");
    const updated = patchOptionByKey(withoutB, "k-a", { title: "A-updated" });

    expect(updated).toEqual([
      { _key: "k-a", id: "a", title: "A-updated" },
      { _key: "k-c", id: "c", title: "C" },
    ]);
  });

  it("존재하지 않는 key는 다른 옵션을 변경하지 않는다", () => {
    const initial: OptionFixture[] = [
      { _key: "k-a", id: "a", title: "A" },
      { _key: "k-b", id: "b", title: "B" },
    ];

    const updated = patchOptionByKey(initial, "missing", { title: "X" });

    expect(updated).toEqual(initial);
  });
});
