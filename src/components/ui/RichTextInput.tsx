'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import React, { useEffect, useState } from 'react';

interface RichTextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextInput({ value, onChange, placeholder, className = '' }: RichTextInputProps) {
  // Fix cursor jumping by not depending strictly on `value` for the editor state
  // Only update editor content when parent changes the value AND we don't have focus
  const [isFocused, setIsFocused] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
        horizontalRule: false,
        codeBlock: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#33415C] underline',
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-sm prose-slate focus:outline-none min-h-[36px] px-3 py-2 border border-[#E4E4DF] rounded-[4px] text-sm text-[#1C1C1A] placeholder:text-[#6B6B63]/50 focus:ring-2 focus:ring-[#33415C] focus:border-transparent bg-white',
      },
    },
    onUpdate: ({ editor }) => {
      // Extract HTML, but if it's just empty paragraphs, treat as empty string
      const html = editor.isEmpty ? '' : editor.getHTML();
      onChange(html);
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
  });

  // Update editor content when `value` prop changes externally (e.g. AI suggestions, initial load)
  useEffect(() => {
    if (editor && !isFocused && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor, isFocused]);

  if (!editor) {
    return <div className="h-[36px] border border-[#E4E4DF] rounded-[4px] bg-gray-50" />;
  }

  const toggleLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    if (previousUrl) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const url = window.prompt('URL', '');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className={`flex-1 flex flex-col ${className}`}>
      <div className="flex items-center gap-1 mb-1 px-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1 rounded text-xs font-semibold ${editor.isActive('bold') ? 'bg-[#33415C]/10 text-[#33415C]' : 'text-[#6B6B63] hover:bg-gray-100'}`}
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1 rounded text-xs italic font-serif ${editor.isActive('italic') ? 'bg-[#33415C]/10 text-[#33415C]' : 'text-[#6B6B63] hover:bg-gray-100'}`}
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1 rounded text-xs line-through ${editor.isActive('strike') ? 'bg-[#33415C]/10 text-[#33415C]' : 'text-[#6B6B63] hover:bg-gray-100'}`}
          title="Strikethrough"
        >
          S
        </button>
        <div className="w-px h-4 bg-[#E4E4DF] mx-1" />
        <button
          type="button"
          onClick={toggleLink}
          className={`p-1 rounded text-xs ${editor.isActive('link') ? 'bg-[#33415C]/10 text-[#33415C]' : 'text-[#6B6B63] hover:bg-gray-100'}`}
          title="Add Link"
        >
          🔗
        </button>
      </div>
      <EditorContent editor={editor} className="flex-1" />
    </div>
  );
}
