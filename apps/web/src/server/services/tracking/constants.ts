export const FUNNEL_NODE_LABELS = {
  START: "시작",
  DROP: "이탈",
  ENTRY_SUFFIX: "",
  RESPONSE_SUFFIX: "완료",
  DROP_SUFFIX: "이탈",
} as const;

export const FUNNEL_NODE_TYPES = {
  START: "start",
  ENTRY: "entry",
  RESPONSE: "response",
  DROP: "drop",
} as const;
