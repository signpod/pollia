"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/admin/components/shadcn-ui/collapsible";
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
import type { NavGroup, NavItem } from "@/app/admin/config/nav";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface NavProps {
  config: NavGroup[];
  isActive: (url: string) => boolean;
}

export function Nav({ config, isActive }: NavProps) {
  const [openGroups, setOpenGroups] = useState<string[]>(config.map(group => group.label));
  const [openEventItems, setOpenEventItems] = useState<string[]>([]);

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

  return (
    <>
      {config.map(group => {
        const isGroupOpen = openGroups.includes(group.label);
        const isEventGroup = group.label === "이벤트";
        const isMissionGroup = group.label === "미션";
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
                            openEventItems={openEventItems}
                            toggleEventItem={toggleEventItem}
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
                          openEventItems={openEventItems}
                          toggleEventItem={toggleEventItem}
                        />
                      ))}
                    </SidebarMenu>
                  )}
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        );
      })}
    </>
  );
}

interface NavItemComponentProps {
  item: NavItem;
  isActive: (url: string) => boolean;
  isEventGroup?: boolean;
  openEventItems?: string[];
  toggleEventItem?: (url: string, e: React.MouseEvent) => void;
}

function NavItemComponent({
  item,
  isActive,
  isEventGroup,
  openEventItems = [],
  toggleEventItem,
}: NavItemComponentProps) {
  const hasSubItems = item.items && item.items.length > 0;
  const itemIsActive = isActive(item.url);
  const subItemIsActive = item.items?.some(subItem => isActive(subItem.url)) ?? false;
  const isEventItemOpen = openEventItems.includes(item.url);

  if (hasSubItems && isEventGroup) {
    return (
      <>
        <SidebarMenuItem>
          <div className="relative flex items-center w-full">
            <SidebarMenuButton
              asChild
              isActive={itemIsActive || subItemIsActive}
              tooltip={item.title}
              className="flex-1 pr-8"
            >
              <Link href={item.url}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
            <button
              type="button"
              onClick={e => toggleEventItem?.(item.url, e)}
              className="absolute right-2 p-1 hover:bg-sidebar-accent rounded-sm transition-colors"
            >
              <ChevronRight
                className={`size-4 transition-transform duration-200 ${isEventItemOpen ? "rotate-90" : ""}`}
              />
            </button>
          </div>
        </SidebarMenuItem>
        {isEventItemOpen && (
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
