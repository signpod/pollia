import type { LucideIcon } from "lucide-react";
import { ClipboardList, Settings } from "lucide-react";
import { ADMIN_ROUTES } from "../constants/routes";

export interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  items?: NavItem[];
}

export interface NavGroup {
  label: string;
  icon?: LucideIcon;
  items: NavItem[];
}

export interface MissionItem {
  id: string;
  title: string;
}

export function createAdminNavConfig(missions: MissionItem[]): NavGroup[] {
  const missionItems: NavItem[] = missions.map(mission => ({
    title: mission.title,
    url: ADMIN_ROUTES.ADMIN_MISSION(mission.id),
    icon: ClipboardList,
  }));

  return [
    {
      label: "미션",
      items: missionItems,
    },
    {
      label: "시스템",
      items: [
        {
          title: "설정",
          url: ADMIN_ROUTES.ADMIN_SETTINGS,
          icon: Settings,
        },
      ],
    },
  ];
}
