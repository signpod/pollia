"use client";

import { cn } from "@/lib/utils";
import { Typo } from "@repo/ui/components";
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
import { useCallback, useEffect, useRef } from "react";

function getTextLength(html: string): number {
  if (!html) return 0;
  const div = typeof document !== "undefined" ? document.createElement("div") : null;
  if (!div) return html.replace(/<[^>]*>/g, "").length;
  div.innerHTML = html;
  return div.textContent?.length ?? 0;
}

interface MarkdownEditorToolbarProps {
  editor: Editor;
}

function MarkdownEditorToolbar({ editor }: MarkdownEditorToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-zinc-200 bg-zinc-50 p-1.5">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        onMouseDown={e => e.preventDefault()}
        className={cn(
          "rounded p-1.5 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900",
          editor.isActive("bold") && "bg-violet-100 text-violet-700",
        )}
        aria-label="굵게"
      >
        <Bold className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        onMouseDown={e => e.preventDefault()}
        className={cn(
          "rounded p-1.5 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900",
          editor.isActive("italic") && "bg-violet-100 text-violet-700",
        )}
        aria-label="기울임"
      >
        <Italic className="h-4 w-4" />
      </button>
      <span className="mx-1 h-4 w-px bg-zinc-200" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        onMouseDown={e => e.preventDefault()}
        className={cn(
          "rounded p-1.5 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900",
          editor.isActive("heading", { level: 1 }) && "bg-violet-100 text-violet-700",
        )}
        aria-label="제목 1"
      >
        <Heading1 className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        onMouseDown={e => e.preventDefault()}
        className={cn(
          "rounded p-1.5 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900",
          editor.isActive("heading", { level: 2 }) && "bg-violet-100 text-violet-700",
        )}
        aria-label="제목 2"
      >
        <Heading2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        onMouseDown={e => e.preventDefault()}
        className={cn(
          "rounded p-1.5 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900",
          editor.isActive("heading", { level: 3 }) && "bg-violet-100 text-violet-700",
        )}
        aria-label="제목 3"
      >
        <Heading3 className="h-4 w-4" />
      </button>
      <span className="mx-1 h-4 w-px bg-zinc-200" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        onMouseDown={e => e.preventDefault()}
        className={cn(
          "rounded p-1.5 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900",
          editor.isActive("bulletList") && "bg-violet-100 text-violet-700",
        )}
        aria-label="목록"
      >
        <List className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        onMouseDown={e => e.preventDefault()}
        className={cn(
          "rounded p-1.5 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900",
          editor.isActive("orderedList") && "bg-violet-100 text-violet-700",
        )}
        aria-label="번호 목록"
      >
        <ListOrdered className="h-4 w-4" />
      </button>
      <span className="mx-1 h-4 w-px bg-zinc-200" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        onMouseDown={e => e.preventDefault()}
        className={cn(
          "rounded p-1.5 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900",
          editor.isActive("blockquote") && "bg-violet-100 text-violet-700",
        )}
        aria-label="인용"
      >
        <Quote className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        onMouseDown={e => e.preventDefault()}
        className={cn(
          "rounded p-1.5 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900",
          editor.isActive("code") && "bg-violet-100 text-violet-700",
        )}
        aria-label="인라인 코드"
      >
        <Code className="h-4 w-4" />
      </button>
    </div>
  );
}

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  rows?: number;
  label?: string;
  labelSize?: "medium" | "small";
  maxLength?: number;
}

export function MarkdownEditor({
  value,
  onChange,
  onBlur,
  placeholder = "내용을 입력하세요...",
  rows = 4,
  label,
  labelSize = "small",
  maxLength,
}: MarkdownEditorProps) {
  const isExternalUpdate = useRef(false);
  const initialValueRef = useRef(value);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: initialValueRef.current,
    editorProps: {
      attributes: {
        class:
          "markdown-editor-body min-w-0 flex-1 resize-none border-0 bg-transparent p-3 text-zinc-900 outline-none [&_h1]:text-xl [&_h1]:font-bold [&_h2]:text-lg [&_h2]:font-bold [&_h3]:text-base [&_h3]:font-bold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-2 [&_blockquote]:border-zinc-300 [&_blockquote]:pl-3 [&_blockquote]:italic [&_code]:rounded [&_code]:bg-zinc-100 [&_code]:px-1 [&_code]:font-mono",
      },
      handleDOMEvents: {
        blur: () => {
          onBlur?.();
        },
      },
    },
    onUpdate: ({ editor: ed }) => {
      if (isExternalUpdate.current) return;
      const html = ed.getHTML();
      if (maxLength != null && getTextLength(html) > maxLength) return;
      onChange(html);
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      isExternalUpdate.current = true;
      editor.commands.setContent(value, { emitUpdate: false });
      isExternalUpdate.current = false;
    }
  }, [value, editor]);

  const currentLength = editor ? getTextLength(editor.getHTML()) : 0;
  const isOverLimit = maxLength != null && currentLength > maxLength;
  const isNearLimit = maxLength != null && maxLength > 0 && currentLength >= maxLength * 0.85;

  const minHeightStyle = useCallback(
    () => ({ minHeight: `${Math.max(rows * 1.75, 10)}rem` }),
    [rows],
  );

  return (
    <div className="w-full overflow-visible">
      <style>
        {
          ".markdown-editor-body p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: #a1a1aa; float: left; height: 0; pointer-events: none; }"
        }
      </style>
      {label && (
        <label className="block">
          <Typo.Body size={labelSize} className="font-medium text-zinc-900">
            {label}
          </Typo.Body>
        </label>
      )}
      <div
        className={cn(
          "overflow-visible rounded-lg border border-zinc-200 bg-white",
          isOverLimit && "border-red-500 ring-1 ring-red-500",
        )}
      >
        {editor && <MarkdownEditorToolbar editor={editor} />}
        <div style={minHeightStyle()} className="relative overflow-visible">
          {editor && <EditorContent editor={editor} />}
        </div>
        {maxLength != null && (
          <div
            className={cn(
              "border-t border-zinc-100 px-3 py-1.5 text-right",
              isOverLimit && "text-red-600",
              isNearLimit && !isOverLimit && "text-amber-600",
            )}
          >
            <Typo.Body size="small">
              {currentLength} / {maxLength}
            </Typo.Body>
          </div>
        )}
      </div>
    </div>
  );
}
