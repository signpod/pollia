import UBQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import type { LucideIcon } from "lucide-react";
import { Calendar, ClipboardList } from "lucide-react";
import { ADMIN_ROUTES } from "../constants/routes";

export interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  items?: NavItem[];
  missionId?: string;
  eventId?: string | null;
}

export interface NavGroup {
  label: string;
  icon?: LucideIcon;
  items: NavItem[];
}

export interface MissionItem {
  id: string;
  title: string;
  eventId: string | null;
}

export interface EventItem {
  id: string;
  title: string;
}

export function createAdminNavConfig(events: EventItem[], missions: MissionItem[]): NavGroup[] {
  const eventGroups: NavItem[] = events.map(event => {
    const eventMissions = missions
      .filter(mission => mission.eventId === event.id)
      .map(mission => ({
        title: mission.title,
        url: ADMIN_ROUTES.ADMIN_MISSION(mission.id),
        icon: ClipboardList,
        missionId: mission.id,
        eventId: mission.eventId,
      }));

    return {
      title: event.title,
      url: ADMIN_ROUTES.ADMIN_EVENT(event.id),
      icon: Calendar,
      items: eventMissions,
    };
  });

  const unassignedMissions = missions
    .filter(mission => mission.eventId === null)
    .map(mission => ({
      title: mission.title,
      url: ADMIN_ROUTES.ADMIN_MISSION(mission.id),
      icon: ClipboardList,
      missionId: mission.id,
      eventId: mission.eventId,
    }));

  const navGroups: NavGroup[] = [];

  if (eventGroups.length > 0) {
    navGroups.push({
      label: UBQUITOUS_CONSTANTS.EVENT,
      items: eventGroups,
    });
  }

  if (unassignedMissions.length > 0) {
    navGroups.push({
      label: UBQUITOUS_CONSTANTS.MISSION,
      items: unassignedMissions,
    });
  }

  return navGroups;
}
