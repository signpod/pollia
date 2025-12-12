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

  const toggleGroup = (label: string) => {
    setOpenGroups(prev =>
      prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label],
    );
  };

  return (
    <>
      {config.map(group => {
        const isGroupOpen = openGroups.includes(group.label);
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
                          <NavItemComponent key={item.url} item={item} isActive={isActive} />
                        ))}
                      </SidebarMenu>
                    </ScrollArea>
                  ) : (
                    <SidebarMenu>
                      {group.items.map(item => (
                        <NavItemComponent key={item.url} item={item} isActive={isActive} />
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
}

function NavItemComponent({ item, isActive }: NavItemComponentProps) {
  const hasSubItems = item.items && item.items.length > 0;
  const itemIsActive = isActive(item.url);
  const subItemIsActive = item.items?.some(subItem => isActive(subItem.url)) ?? false;

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
