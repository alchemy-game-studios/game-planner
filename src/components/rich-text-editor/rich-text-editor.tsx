import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { useEffect, useCallback, useRef } from 'react';
import { MentionExtension, MentionSuggestion } from './mention-extension';

export interface EntityMention {
  id: string;
  name: string;
  type: string;
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  entityType: string;
  entityId: string;
  onMentionInsert?: (mention: EntityMention) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

// Convert plain text to HTML paragraphs (for legacy content)
function textToHtml(text: string): string {
  if (!text) return '';
  // If it already looks like HTML, return as-is
  if (text.trim().startsWith('<')) return text;
  // Convert newlines to paragraphs
  return text
    .split(/\n\n+/)
    .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
    .join('');
}

export function RichTextEditor({
  value,
  onChange,
  entityType,
  entityId,
  onMentionInsert,
  placeholder = 'Start writing...',
  className = '',
  readOnly = false
}: RichTextEditorProps) {
  const isUserEditing = useRef(false);
  const lastSavedValue = useRef(value);
  const hasInitialized = useRef(false);

  const handleMentionSelect = useCallback((mention: EntityMention) => {
    if (onMentionInsert) {
      onMentionInsert(mention);
    }
  }, [onMentionInsert]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Link.configure({
        openOnClick: false, // Don't navigate when editing
        HTMLAttributes: {
          class: 'text-secondary hover:text-ck-gold underline'
        }
      }),
      MentionExtension.configure({
        HTMLAttributes: {
          class: 'mention-chip'
        },
        suggestion: MentionSuggestion({
          entityType,
          entityId,
          onSelect: handleMentionSelect
        })
      })
    ],
    content: '',
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: `prose prose-invert max-w-none focus:outline-none min-h-[100px] text-xl font-book text-card-foreground leading-relaxed ${className}`,
        'data-placeholder': placeholder
      }
    },
    onFocus: () => {
      isUserEditing.current = true;
    },
    onBlur: () => {
      isUserEditing.current = false;
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Store HTML directly to preserve mention chips
      if (html !== lastSavedValue.current) {
        lastSavedValue.current = html;
        onChange(html);
      }
    }
  });

  // Sync content when value changes from parent (e.g., after fetch)
  useEffect(() => {
    if (!editor) return;

    // Don't update while user is actively editing
    if (isUserEditing.current) return;

    // Check if this is new content from parent
    if (value !== lastSavedValue.current) {
      const htmlContent = textToHtml(value);
      const currentHtml = editor.getHTML();

      // Only update if content actually differs
      if (htmlContent !== currentHtml) {
        editor.commands.setContent(htmlContent, false);
        lastSavedValue.current = value;
        hasInitialized.current = true;
      }
    }
  }, [editor, value]);

  if (!editor) {
    return null;
  }

  return (
    <div className={`rich-text-editor relative ${readOnly ? 'read-only' : 'editable'}`}>
      <EditorContent editor={editor} />
      <style>{`
        .rich-text-editor .ProseMirror {
          min-height: ${readOnly ? 'auto' : '100px'};
          padding: ${readOnly ? '0' : '0.75rem'};
          border-radius: 0.5rem;
          border: 1px solid transparent;
          transition: border-color 0.2s, background-color 0.2s;
        }
        .rich-text-editor.editable .ProseMirror:hover {
          background-color: rgba(255, 255, 255, 0.02);
        }
        .rich-text-editor.editable .ProseMirror:focus {
          outline: none;
          border-color: var(--ck-ember);
          background-color: rgba(255, 255, 255, 0.03);
        }
        .rich-text-editor .ProseMirror p {
          margin-bottom: 1em;
        }
        .rich-text-editor .ProseMirror p:last-child {
          margin-bottom: 0;
        }
        .rich-text-editor.editable .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: var(--ck-stone);
          pointer-events: none;
          float: left;
          height: 0;
        }
        .mention-chip {
          display: inline-flex;
          align-items: center;
          padding: 0.125rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
        }
        .mention-chip[data-type="place"] {
          background-color: rgba(58, 183, 168, 0.2);
          border: 1px solid rgba(58, 183, 168, 0.3);
          color: var(--ck-teal);
        }
        .mention-chip[data-type="character"] {
          background-color: rgba(124, 58, 237, 0.2);
          border: 1px solid rgba(124, 58, 237, 0.3);
          color: var(--ck-rare);
        }
        .mention-chip[data-type="item"] {
          background-color: rgba(255, 183, 3, 0.2);
          border: 1px solid rgba(255, 183, 3, 0.3);
          color: var(--ck-gold);
        }
        .mention-chip[data-type="event"],
        .mention-chip[data-type="narrative"] {
          background-color: rgba(242, 140, 40, 0.2);
          border: 1px solid rgba(242, 140, 40, 0.3);
          color: var(--ck-ember);
        }
      `}</style>
    </div>
  );
}
