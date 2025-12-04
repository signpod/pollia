"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import { cn } from "@/app/admin/lib/utils";
import type { Editor } from "@tiptap/core";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
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
import { useEffect } from "react";

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

function TiptapToolbar({ editor }: TiptapToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/50 p-2">
      <div className="flex gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(editor.isActive("bold") && "bg-accent")}
          aria-label="굵게"
        >
          <Bold className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(editor.isActive("italic") && "bg-accent")}
          aria-label="기울임"
        >
          <Italic className="size-4" />
        </Button>
      </div>

      <div className="mx-1 h-4 w-px bg-border" />

      <div className="flex gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={cn(editor.isActive("heading", { level: 1 }) && "bg-accent")}
          aria-label="제목 1"
        >
          <Heading1 className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn(editor.isActive("heading", { level: 2 }) && "bg-accent")}
          aria-label="제목 2"
        >
          <Heading2 className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn(editor.isActive("heading", { level: 3 }) && "bg-accent")}
          aria-label="제목 3"
        >
          <Heading3 className="size-4" />
        </Button>
      </div>

      <div className="mx-1 h-4 w-px bg-border" />

      <div className="flex gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(editor.isActive("bulletList") && "bg-accent")}
          aria-label="목록"
        >
          <List className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(editor.isActive("orderedList") && "bg-accent")}
          aria-label="번호 목록"
        >
          <ListOrdered className="size-4" />
        </Button>
      </div>

      <div className="mx-1 h-4 w-px bg-border" />

      <div className="flex gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn(editor.isActive("blockquote") && "bg-accent")}
          aria-label="인용"
        >
          <Quote className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={cn(editor.isActive("codeBlock") && "bg-accent")}
          aria-label="코드 블록"
        >
          <Code className="size-4" />
        </Button>
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
  const editor = useEditor({
    extensions: [
      StarterKit,
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
    onUpdate: ({ editor }: { editor: Editor }) => {
      onUpdate?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div
      className={cn(
        "tiptap-editor overflow-hidden rounded-md border border-input bg-background",
        !editable && "border-transparent",
        className,
      )}
    >
      {showToolbar && editable && <TiptapToolbar editor={editor} />}
      <div className={cn("min-h-[120px] p-4", !editable && "p-0")}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

export type { Editor };
