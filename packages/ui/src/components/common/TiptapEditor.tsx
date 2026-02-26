"use client";

import type { Editor } from "@tiptap/core";
import Placeholder from "@tiptap/extension-placeholder";
import { TextAlign } from "@tiptap/extension-text-align";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { LucideIcon } from "lucide-react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Quote,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";

const ALIGN_OPTIONS: ReadonlyArray<{
  value: string;
  icon: LucideIcon;
  label: string;
}> = [
  { value: "left", icon: AlignLeft, label: "왼쪽 정렬" },
  { value: "center", icon: AlignCenter, label: "가운데 정렬" },
  { value: "right", icon: AlignRight, label: "오른쪽 정렬" },
  { value: "justify", icon: AlignJustify, label: "양쪽 정렬" },
];

export interface TiptapEditorProps {
  content?: string;
  onUpdate?: (content: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
  showToolbar?: boolean;
}

interface TiptapToolbarProps {
  editor: Editor;
}

function ToolbarButton({
  active,
  onClick,
  ariaLabel,
  children,
}: {
  active: boolean;
  onClick: () => void;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={cn("h-8 w-8 rounded-md", active && "bg-accent text-accent-foreground")}
      aria-label={ariaLabel}
    >
      {children}
    </Button>
  );
}

function TiptapToolbar({ editor }: TiptapToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/50 p-2">
      <div className="flex gap-1">
        <ToolbarButton
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          ariaLabel="굵게"
        >
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          ariaLabel="기울임"
        >
          <Italic className="size-4" />
        </ToolbarButton>
      </div>

      <div className="mx-1 h-4 w-px bg-border" />

      <div className="flex gap-1">
        <ToolbarButton
          active={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          ariaLabel="제목 1"
        >
          <Heading1 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          ariaLabel="제목 2"
        >
          <Heading2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          ariaLabel="제목 3"
        >
          <Heading3 className="size-4" />
        </ToolbarButton>
      </div>

      <div className="mx-1 h-4 w-px bg-border" />

      <div className="flex gap-1">
        <ToolbarButton
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          ariaLabel="목록"
        >
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          ariaLabel="번호 목록"
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>
      </div>

      <div className="mx-1 h-4 w-px bg-border" />

      <div className="flex gap-1">
        <ToolbarButton
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          ariaLabel="인용"
        >
          <Quote className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          ariaLabel="코드 블록"
        >
          <Code className="size-4" />
        </ToolbarButton>
      </div>

      <div className="mx-1 h-4 w-px bg-border" />

      <div className="flex gap-1">
        {ALIGN_OPTIONS.map(({ value, icon: Icon, label }) => (
          <ToolbarButton
            key={value}
            active={editor.isActive({ textAlign: value })}
            onClick={() => editor.chain().focus().setTextAlign(value).run()}
            ariaLabel={label}
          >
            <Icon className="size-4" />
          </ToolbarButton>
        ))}
      </div>
    </div>
  );
}

export function TiptapEditor({
  content = "",
  onUpdate,
  placeholder,
  className,
  editable = true,
  showToolbar = false,
}: TiptapEditorProps) {
  const isInitialized = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({
        placeholder: placeholder || "내용을 입력하세요...",
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content,
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "tiptap",
      },
    },
    onUpdate: ({ editor: tiptapEditor }: { editor: Editor }) => {
      if (isInitialized.current) {
        onUpdate?.(tiptapEditor.getHTML());
      }
    },
    onCreate: () => {
      isInitialized.current = true;
    },
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      isInitialized.current = false;
      editor.commands.setContent(content);
      isInitialized.current = true;
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  return (
    <div className={cn("tiptap-editor overflow-hidden rounded-md bg-background", className)}>
      {showToolbar && editable && editor && <TiptapToolbar editor={editor} />}
      <div className={cn("min-h-[120px] p-4", !editable && "p-0")}>
        {editor && <EditorContent editor={editor} />}
      </div>
    </div>
  );
}

export type { Editor };
