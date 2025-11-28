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

export interface SurveyItem {
  id: string;
  title: string;
}

export function createAdminNavConfig(surveys: SurveyItem[] = []): NavGroup[] {
  const surveyItems: NavItem[] = surveys.map(survey => ({
    title: survey.title,
    url: ADMIN_ROUTES.ADMIN_SURVEY(survey.id),
    icon: ClipboardList,
  }));

  return [
    {
      label: "설문",
      items: surveyItems,
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
