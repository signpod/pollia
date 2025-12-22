import { actionRepository } from "@/server/repositories/action/actionRepository";
import { missionRepository } from "@/server/repositories/mission/missionRepository";
import { trackingActionEntryRepository } from "@/server/repositories/tracking-action-entry";
import { trackingActionResponseRepository } from "@/server/repositories/tracking-action-response";
import { FUNNEL_NODE_ID_PATTERNS, FUNNEL_NODE_LABELS } from "@/server/services/tracking/constants";
import type { GetMissionFunnelOptions, MissionFunnelData } from "./types";

interface SessionMaps {
  sessionEntries: Map<string, Set<string>>;
  sessionResponses: Map<string, Set<string>>;
}

interface Statistics {
  totalSessions: number;
  totalStarted: number;
  totalCompleted: number;
  completionRate: number;
}

interface ActionSummary {
  id: string;
  title: string;
  order: number;
}

export class TrackingActionService {
  constructor(
    private missionRepo = missionRepository,
    private actionRepo = actionRepository,
    private entryRepo = trackingActionEntryRepository,
    private responseRepo = trackingActionResponseRepository,
  ) {}

  async getMissionFunnel(
    missionId: string,
    userId: string,
    _options: GetMissionFunnelOptions = {},
  ): Promise<MissionFunnelData> {
    await this.validateAccess(missionId, userId);

    const actions = await this.getActions(missionId);
    if (actions.length === 0) {
      return this.emptyFunnelData();
    }

    const sessionMaps = await this.buildSessionMaps(missionId);
    const statistics = this.calculateStatistics(actions, sessionMaps);
    const nodes = this.buildNodes(actions, sessionMaps, statistics);
    const links = this.buildLinks(actions, sessionMaps, statistics);
    const metadata = this.buildMetadata(actions, sessionMaps);

    return {
      nodes,
      links,
      metadata: {
        ...statistics,
        actions: metadata,
      },
    };
  }

  private async validateAccess(missionId: string, userId: string): Promise<void> {
    const mission = await this.missionRepo.findById(missionId);

    if (!mission) {
      const error = new Error("미션을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    if (mission.creatorId !== userId) {
      const error = new Error("조회 권한이 없습니다.");
      error.cause = 403;
      throw error;
    }
  }

  private async getActions(missionId: string): Promise<ActionSummary[]> {
    const actionsWithDetails = await this.actionRepo.findDetailsByMissionId(missionId);

    return actionsWithDetails.map(action => ({
      id: action.id,
      title: action.title,
      order: action.order,
    }));
  }

  private emptyFunnelData(): MissionFunnelData {
    return {
      nodes: [],
      links: [],
      metadata: {
        totalSessions: 0,
        totalStarted: 0,
        totalCompleted: 0,
        completionRate: 0,
        actions: [],
      },
    };
  }

  private async buildSessionMaps(missionId: string): Promise<SessionMaps> {
    const entries = await this.entryRepo.findByMissionId(missionId);
    const responses = await this.responseRepo.findByMissionId(missionId);

    const sessionEntries = entries.reduce((map, entry) => {
      const existingSet = map.get(entry.sessionId);
      if (!existingSet) {
        map.set(entry.sessionId, new Set([entry.actionId]));
      } else {
        existingSet.add(entry.actionId);
      }
      return map;
    }, new Map<string, Set<string>>());

    const sessionResponses = responses.reduce((map, response) => {
      const existingSet = map.get(response.sessionId);
      if (!existingSet) {
        map.set(response.sessionId, new Set([response.actionId]));
      } else {
        existingSet.add(response.actionId);
      }
      return map;
    }, new Map<string, Set<string>>());

    return { sessionEntries, sessionResponses };
  }

  private calculateStatistics(actions: ActionSummary[], sessionMaps: SessionMaps): Statistics {
    const { sessionEntries, sessionResponses } = sessionMaps;

    const totalSessions = new Set([...sessionEntries.keys(), ...sessionResponses.keys()]).size;
    const totalStarted = sessionEntries.size;
    const totalCompleted = Array.from(sessionResponses.values()).filter(actionSet =>
      actions.every(action => actionSet.has(action.id)),
    ).length;
    const completionRate = totalStarted > 0 ? (totalCompleted / totalStarted) * 100 : 0;

    return {
      totalSessions,
      totalStarted,
      totalCompleted,
      completionRate,
    };
  }

  private buildNodes(
    actions: ActionSummary[],
    sessionMaps: SessionMaps,
    statistics: Statistics,
  ): MissionFunnelData["nodes"] {
    const { sessionEntries, sessionResponses } = sessionMaps;

    const startNode: MissionFunnelData["nodes"][0] = {
      id: FUNNEL_NODE_ID_PATTERNS.START,
      name: FUNNEL_NODE_LABELS.START,
      type: "start",
      count: statistics.totalStarted,
    };

    const actionNodes = actions.flatMap(action => {
      const entryCount = Array.from(sessionEntries.values()).filter(actionSet =>
        actionSet.has(action.id),
      ).length;

      const responseCount = Array.from(sessionResponses.values()).filter(actionSet =>
        actionSet.has(action.id),
      ).length;

      return [
        {
          id: FUNNEL_NODE_ID_PATTERNS.ENTRY(action.id),
          name: `${action.title} ${FUNNEL_NODE_LABELS.ENTRY_SUFFIX}`,
          type: "entry" as const,
          count: entryCount,
        },
        {
          id: FUNNEL_NODE_ID_PATTERNS.DROP_ENTRY(action.id),
          name: FUNNEL_NODE_LABELS.DROP,
          type: "drop" as const,
          count: 0,
        },
        {
          id: FUNNEL_NODE_ID_PATTERNS.RESPONSE(action.id),
          name: `${action.title} ${FUNNEL_NODE_LABELS.RESPONSE_SUFFIX}`,
          type: "response" as const,
          count: responseCount,
        },
        {
          id: FUNNEL_NODE_ID_PATTERNS.DROP_RESPONSE(action.id),
          name: FUNNEL_NODE_LABELS.DROP,
          type: "drop" as const,
          count: 0,
        },
      ];
    });

    return [startNode, ...actionNodes];
  }

  private buildLinks(
    actions: ActionSummary[],
    sessionMaps: SessionMaps,
    statistics: Statistics,
  ): MissionFunnelData["links"] {
    const { sessionEntries, sessionResponses } = sessionMaps;

    const actionLinks = actions.flatMap((action, index) => {
      const links: MissionFunnelData["links"] = [];

      const entryCount = Array.from(sessionEntries.values()).filter(actionSet =>
        actionSet.has(action.id),
      ).length;

      const responseCount = Array.from(sessionResponses.values()).filter(actionSet =>
        actionSet.has(action.id),
      ).length;

      // 첫 번째 액션: 시작 노드에서 연결
      if (index === 0) {
        const dropFromStart = statistics.totalStarted - entryCount;

        links.push({
          source: FUNNEL_NODE_ID_PATTERNS.START,
          target: FUNNEL_NODE_ID_PATTERNS.ENTRY(action.id),
          value: entryCount,
        });

        if (dropFromStart > 0) {
          links.push({
            source: FUNNEL_NODE_ID_PATTERNS.START,
            target: FUNNEL_NODE_ID_PATTERNS.DROP_ENTRY(action.id),
            value: dropFromStart,
          });
        }
      } else {
        // 이전 액션에서 연결
        const previousAction = actions[index - 1];
        if (previousAction) {
          const transitionCount = Array.from(sessionResponses.values()).filter(
            actionSet => actionSet.has(previousAction.id) && actionSet.has(action.id),
          ).length;

          links.push({
            source: FUNNEL_NODE_ID_PATTERNS.RESPONSE(previousAction.id),
            target: FUNNEL_NODE_ID_PATTERNS.ENTRY(action.id),
            value: transitionCount,
          });
        }
      }

      // 진입 → 응답 링크
      const dropFromEntryToResponse = entryCount - responseCount;

      links.push({
        source: FUNNEL_NODE_ID_PATTERNS.ENTRY(action.id),
        target: FUNNEL_NODE_ID_PATTERNS.RESPONSE(action.id),
        value: responseCount,
      });

      if (dropFromEntryToResponse > 0) {
        links.push({
          source: FUNNEL_NODE_ID_PATTERNS.ENTRY(action.id),
          target: FUNNEL_NODE_ID_PATTERNS.DROP_RESPONSE(action.id),
          value: dropFromEntryToResponse,
        });
      }

      return links;
    });

    return actionLinks;
  }

  private buildMetadata(
    actions: ActionSummary[],
    sessionMaps: SessionMaps,
  ): MissionFunnelData["metadata"]["actions"] {
    const { sessionEntries, sessionResponses } = sessionMaps;

    return actions.map(action => {
      const entryCount = Array.from(sessionEntries.values()).filter(actionSet =>
        actionSet.has(action.id),
      ).length;

      const responseCount = Array.from(sessionResponses.values()).filter(actionSet =>
        actionSet.has(action.id),
      ).length;

      const entryToResponseRate = entryCount > 0 ? (responseCount / entryCount) * 100 : 0;

      return {
        id: action.id,
        title: action.title,
        order: action.order,
        entryCount,
        responseCount,
        entryToResponseRate,
      };
    });
  }
}

export const trackingActionService = new TrackingActionService();
