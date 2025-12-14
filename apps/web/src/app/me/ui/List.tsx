import { formatDateToLocalString } from "@/lib/date";
import { Typo } from "@repo/ui/components";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { ComponentPropsWithRef } from "react";

function ListRoot({ children, ...props }: ComponentPropsWithRef<"section">) {
  return (
    <section className="flex flex-col gap-3 px-5" {...props}>
      {children}
    </section>
  );
}

interface ListHeaderProps extends ComponentPropsWithRef<"div"> {
  title: string;
  action?: React.ReactNode;
}

function ListHeader({ title, action, ...props }: ListHeaderProps) {
  return (
    <div className="flex items-center justify-between" {...props}>
      <Typo.MainTitle size="small">{title}</Typo.MainTitle>
      {action}
    </div>
  );
}

function ListContent({ children, ...props }: ComponentPropsWithRef<"ul">) {
  return (
    <ul {...props} className="flex flex-col gap-0">
      {children}
    </ul>
  );
}

interface ListItemProps extends ComponentPropsWithRef<"li"> {
  title: string;
  leadingIcon?: React.ReactNode;
  href: string;
  createdAt?: Date | string;
  isDraft?: boolean;
}

function ListItem({ title, createdAt, isDraft, leadingIcon, href, ...props }: ListItemProps) {
  const formattedDate = createdAt
    ? typeof createdAt === "string"
      ? createdAt.split("T")[0]
      : formatDateToLocalString(createdAt)
    : null;

  return (
    <li {...props}>
      <Link href={href} className="flex flex-col py-4 w-full border-b border-default gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {leadingIcon}

            <Typo.SubTitle size="large" className="flex-1">
              {title}
            </Typo.SubTitle>
          </div>
          <ChevronRight className="size-6 text-zinc-300" />
        </div>
        {formattedDate && (
          <Typo.Body size="small" className="text-zinc-400">
            {formattedDate}
          </Typo.Body>
        )}
      </Link>
    </li>
  );
}

export const List = {
  Root: ListRoot,
  Header: ListHeader,
  Content: ListContent,
  Item: ListItem,
};

