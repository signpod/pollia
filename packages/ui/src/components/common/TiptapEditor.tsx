"use client";

import type { Editor } from "@tiptap/core";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import { cn } from "../../lib/utils";

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
    <div className="flex flex-wrap gap-1 border-b border-zinc-200 p-2">
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            "rounded px-2 py-1 text-sm font-medium transition-colors hover:bg-zinc-100",
            editor.isActive("bold") && "bg-zinc-200",
          )}
        >
          Bold
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            "rounded px-2 py-1 text-sm font-medium transition-colors hover:bg-zinc-100",
            editor.isActive("italic") && "bg-zinc-200",
          )}
        >
          Italic
        </button>
      </div>

      <div className="mx-1 w-px bg-zinc-200" />

      <div className="flex gap-1">
        <select
          onChange={e => {
            const level = Number.parseInt(e.target.value);
            if (level === 0) {
              editor.chain().focus().setParagraph().run();
            } else {
              editor
                .chain()
                .focus()
                .toggleHeading({ level: level as 1 | 2 | 3 })
                .run();
            }
          }}
          value={
            editor.isActive("heading", { level: 1 })
              ? 1
              : editor.isActive("heading", { level: 2 })
                ? 2
                : editor.isActive("heading", { level: 3 })
                  ? 3
                  : 0
          }
          className="rounded border border-zinc-200 px-2 py-1 text-sm"
        >
          <option value={0}>본문</option>
          <option value={1}>제목 1</option>
          <option value={2}>제목 2</option>
          <option value={3}>제목 3</option>
        </select>
      </div>

      <div className="mx-1 w-px bg-zinc-200" />

      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            "rounded px-2 py-1 text-sm font-medium transition-colors hover:bg-zinc-100",
            editor.isActive("bulletList") && "bg-zinc-200",
          )}
        >
          목록
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            "rounded px-2 py-1 text-sm font-medium transition-colors hover:bg-zinc-100",
            editor.isActive("orderedList") && "bg-zinc-200",
          )}
        >
          번호 목록
        </button>
      </div>

      <div className="mx-1 w-px bg-zinc-200" />

      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn(
            "rounded px-2 py-1 text-sm font-medium transition-colors hover:bg-zinc-100",
            editor.isActive("blockquote") && "bg-zinc-200",
          )}
        >
          인용
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={cn(
            "rounded px-2 py-1 text-sm font-medium transition-colors hover:bg-zinc-100",
            editor.isActive("codeBlock") && "bg-zinc-200",
          )}
        >
          코드
        </button>
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

  return (
    <div
      className={cn(
        "tiptap-editor overflow-hidden rounded-md border border-zinc-200",
        !editable && "border-transparent",
        className,
      )}
    >
      {showToolbar && editable && editor && <TiptapToolbar editor={editor} />}
      <div className={cn("min-h-[120px] p-4", !editable && "p-0")}>
        {editor && <EditorContent editor={editor} />}
      </div>
    </div>
  );
}

export type { Editor };
