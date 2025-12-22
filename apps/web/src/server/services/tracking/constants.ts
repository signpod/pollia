export const FUNNEL_NODE_LABELS = {
  START: "시작",
  DROP: "이탈",
  ENTRY_SUFFIX: "(진입)",
  RESPONSE_SUFFIX: "(응답)",
} as const;

export const FUNNEL_NODE_TYPES = {
  START: "start",
  ENTRY: "entry",
  RESPONSE: "response",
  DROP: "drop",
} as const;

export const FUNNEL_NODE_ID_PATTERNS = {
  START: "start",
  ENTRY: (actionId: string) => `${actionId}_entry`,
  RESPONSE: (actionId: string) => `${actionId}_response`,
  DROP_ENTRY: (actionId: string) => `drop_${actionId}_entry`,
  DROP_RESPONSE: (actionId: string) => `drop_${actionId}_response`,
} as const;

