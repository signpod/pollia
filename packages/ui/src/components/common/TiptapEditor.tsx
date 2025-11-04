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
}

export function TiptapEditor({
  content = "",
  onUpdate,
  placeholder,
  className,
  editable = true,
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
        "tiptap-editor min-h-[120px] rounded-md border border-zinc-200 p-4",
        !editable && "border-transparent p-0",
        className,
      )}
    >
      <EditorContent editor={editor} />
    </div>
  );
}

export type { Editor };
