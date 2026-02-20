"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/admin/components/shadcn-ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/admin/components/shadcn-ui/dropdown-menu";
import { ScrollArea } from "@/app/admin/components/shadcn-ui/scroll-area";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/app/admin/components/shadcn-ui/sidebar";
import { Skeleton } from "@/app/admin/components/shadcn-ui/skeleton";
import type { NavGroup, NavItem } from "@/app/admin/config/nav";
import UBQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { ChevronRight, MoreVertical } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MissionEventSelector } from "./MissionEventSelector";

interface NavProps {
  config: NavGroup[];
  isActive: (url: string) => boolean;
  isLoading?: boolean;
}

export function Nav({ config, isActive, isLoading = false }: NavProps) {
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const [openEventItems, setOpenEventItems] = useState<string[]>([]);
  const [selectedMission, setSelectedMission] = useState<{
    id: string;
    title: string;
    eventId: string | null;
  } | null>(null);

  useEffect(() => {
    if (config.length > 0) {
      setOpenGroups(prev => {
        const newGroupLabels = config.map(group => group.label);
        return [...new Set([...prev, ...newGroupLabels])];
      });
    }
  }, [config]);

  const toggleGroup = (label: string) => {
    setOpenGroups(prev =>
      prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label],
    );
  };

  const toggleEventItem = (url: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenEventItems(prev =>
      prev.includes(url) ? prev.filter(item => item !== url) : [...prev, url],
    );
  };

  const handleOpenMissionEventSelector = (
    missionId: string,
    title: string,
    eventId: string | null,
  ) => {
    setSelectedMission({ id: missionId, title, eventId });
  };

  return (
    <>
      {isLoading ? (
        <>
          <SidebarGroup>
            <Skeleton className="h-8 w-full mb-2" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </SidebarGroup>
          <SidebarGroup>
            <Skeleton className="h-8 w-full mb-2" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </SidebarGroup>
        </>
      ) : (
        config.map(group => {
          const isGroupOpen = openGroups.includes(group.label);
          const isEventGroup = group.label === UBQUITOUS_CONSTANTS.EVENT;
          const isMissionGroup = group.label === UBQUITOUS_CONSTANTS.MISSION;
          const shouldScroll = isMissionGroup && group.items.length > 10;

          return (
            <Collapsible
              key={group.label}
              open={isGroupOpen}
              onOpenChange={() => toggleGroup(group.label)}
            >
              <SidebarGroup>
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent">
                    <span>{group.label}</span>
                    <ChevronRight
                      className={`ml-auto transition-transform duration-200 ${isGroupOpen ? "rotate-90" : ""}`}
                    />
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    {shouldScroll ? (
                      <ScrollArea className="h-[400px]">
                        <SidebarMenu>
                          {group.items.map(item => (
                            <NavItemComponent
                              key={item.url}
                              item={item}
                              isActive={isActive}
                              isEventGroup={isEventGroup}
                              isMissionGroup={isMissionGroup}
                              openEventItems={openEventItems}
                              toggleEventItem={toggleEventItem}
                              onOpenMissionEventSelector={handleOpenMissionEventSelector}
                            />
                          ))}
                        </SidebarMenu>
                      </ScrollArea>
                    ) : (
                      <SidebarMenu>
                        {group.items.map(item => (
                          <NavItemComponent
                            key={item.url}
                            item={item}
                            isActive={isActive}
                            isEventGroup={isEventGroup}
                            isMissionGroup={isMissionGroup}
                            openEventItems={openEventItems}
                            toggleEventItem={toggleEventItem}
                            onOpenMissionEventSelector={handleOpenMissionEventSelector}
                          />
                        ))}
                      </SidebarMenu>
                    )}
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          );
        })
      )}

      {selectedMission && (
        <MissionEventSelector
          open={!!selectedMission}
          onOpenChange={open => !open && setSelectedMission(null)}
          missionId={selectedMission.id}
          missionTitle={selectedMission.title}
          currentEventId={selectedMission.eventId}
        />
      )}
    </>
  );
}

interface NavItemComponentProps {
  item: NavItem;
  isActive: (url: string) => boolean;
  isEventGroup?: boolean;
  isMissionGroup?: boolean;
  openEventItems?: string[];
  toggleEventItem?: (url: string, e: React.MouseEvent) => void;
  onOpenMissionEventSelector?: (missionId: string, title: string, eventId: string | null) => void;
}

function NavItemComponent({
  item,
  isActive,
  isEventGroup,
  isMissionGroup,
  openEventItems = [],
  toggleEventItem,
  onOpenMissionEventSelector,
}: NavItemComponentProps) {
  const hasSubItems = item.items && item.items.length > 0;
  const itemIsActive = isActive(item.url);
  const subItemIsActive = item.items?.some(subItem => isActive(subItem.url)) ?? false;
  const isEventItemOpen = openEventItems.includes(item.url);

  // 캠페인 그룹: 하위 프로젝트가 있는 경우 아코디언으로 표시
  if (hasSubItems && isEventGroup) {
    return (
      <>
        <SidebarMenuItem>
          <div className="relative flex items-center w-full group">
            <SidebarMenuButton
              asChild
              isActive={itemIsActive || subItemIsActive}
              tooltip={item.title}
              className="flex-1 pr-8"
            >
              <Link href={item.url}>
                {item.icon && <item.icon />}
                <span className="flex-1">{item.title}</span>
              </Link>
            </SidebarMenuButton>
            {item.items && item.items.length > 0 && (
              <button
                type="button"
                onClick={e => toggleEventItem?.(item.url, e)}
                className="absolute right-1 p-1.5 hover:bg-sidebar-accent rounded-sm transition-colors z-10"
                aria-label={`${UBQUITOUS_CONSTANTS.MISSION} 목록 토글`}
              >
                <ChevronRight
                  className={`size-4 transition-transform duration-200 ${isEventItemOpen ? "rotate-90" : ""}`}
                />
              </button>
            )}
          </div>
        </SidebarMenuItem>
        {isEventItemOpen && item.items && item.items.length > 0 && (
          <SidebarMenuSub className="ml-3.5 mr-0">
            {item.items.map(subItem => (
              <SidebarMenuSubItem key={subItem.url} className="group/submission">
                <div className="relative flex items-center w-full">
                  <SidebarMenuSubButton
                    asChild
                    isActive={isActive(subItem.url)}
                    className="flex-1 pr-4"
                  >
                    <Link href={subItem.url}>
                      {subItem.icon && <subItem.icon className="size-4" />}
                      <span className="flex-1">{subItem.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                  {subItem.missionId && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="absolute right-2 p-1 hover:bg-accent rounded-sm transition-all z-10 opacity-0 group-hover/submission:opacity-100"
                          aria-label={`${UBQUITOUS_CONSTANTS.MISSION} 옵션`}
                          onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <MoreVertical className="size-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            if (subItem.missionId) {
                              onOpenMissionEventSelector?.(
                                subItem.missionId,
                                subItem.title,
                                subItem.eventId ?? null,
                              );
                            }
                          }}
                        >
                          {UBQUITOUS_CONSTANTS.EVENT} 변경
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        )}
      </>
    );
  }

  if (hasSubItems) {
    return (
      <>
        <SidebarMenuItem>
          <SidebarMenuButton isActive={itemIsActive || subItemIsActive} tooltip={item.title}>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuSub>
          {item.items?.map(subItem => (
            <SidebarMenuSubItem key={subItem.url}>
              <SidebarMenuSubButton asChild isActive={isActive(subItem.url)}>
                <Link href={subItem.url}>
                  <span>{subItem.title}</span>
                </Link>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </>
    );
  }

  // 프로젝트 그룹: Ellipsis 버튼 표시
  if (isMissionGroup && item.missionId) {
    return (
      <SidebarMenuItem className="group/mission">
        <div className="relative flex items-center w-full">
          <SidebarMenuButton
            asChild
            isActive={itemIsActive}
            tooltip={item.title}
            className="flex-1 pr-8"
          >
            <Link href={item.url}>
              {item.icon && <item.icon />}
              <span className="flex-1">{item.title}</span>
            </Link>
          </SidebarMenuButton>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="absolute right-2 p-1 hover:bg-accent rounded-sm transition-all z-10 opacity-0 group-hover/mission:opacity-100"
                aria-label={`${UBQUITOUS_CONSTANTS.MISSION} 옵션`}
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <MoreVertical className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  if (item.missionId) {
                    onOpenMissionEventSelector?.(item.missionId, item.title, item.eventId ?? null);
                  }
                }}
              >
                {UBQUITOUS_CONSTANTS.EVENT} 추가
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={itemIsActive} tooltip={item.title}>
        <Link href={item.url}>
          {item.icon && <item.icon />}
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
