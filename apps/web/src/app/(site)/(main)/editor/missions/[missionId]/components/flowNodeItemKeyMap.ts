import {
  DRAFT_ACTION_ID_PREFIX,
  isDraftActionId,
} from "@/app/(site)/mission/[missionId]/manage/actions/logic";
import type { FlowOverviewNodeKind } from "./editor-flow-overview.utils";

const EXISTING_ITEM_PREFIX = "existing:";
const DRAFT_ITEM_PREFIX = "draft:";

export function mapFlowNodeIdToItemKey(nodeId: string, kind: FlowOverviewNodeKind): string | null {
  if (kind === "start" || kind === "completion") {
    return null;
  }

  if (isDraftActionId(nodeId)) {
    const draftKey = nodeId.slice(DRAFT_ACTION_ID_PREFIX.length);
    return `${DRAFT_ITEM_PREFIX}${draftKey}`;
  }

  return `${EXISTING_ITEM_PREFIX}${nodeId}`;
}
