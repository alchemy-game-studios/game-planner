import { Mention } from '@tiptap/extension-mention';
import { ReactRenderer } from '@tiptap/react';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import { MentionList, MentionListRef } from './mention-list';
import { EntityMention } from './rich-text-editor';

interface MentionSuggestionOptions {
  entityType: string;
  entityId: string;
  universeId?: string;
  onSelect?: (mention: EntityMention) => void;
}

export const MentionExtension = Mention.extend({
  name: 'mention',

  // Parse HTML back into mention nodes
  parseHTML() {
    return [
      {
        tag: 'a.mention-chip',
        getAttrs: (element: HTMLElement) => {
          const id = element.getAttribute('data-id');
          const label = element.getAttribute('data-label') || element.textContent?.replace('@', '') || '';
          const type = element.getAttribute('data-type');

          return { id, label, type };
        }
      }
    ];
  },

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-id'),
        renderHTML: attributes => {
          if (!attributes.id) return {};
          return { 'data-id': attributes.id };
        }
      },
      label: {
        default: null,
        parseHTML: element => element.getAttribute('data-label'),
        renderHTML: attributes => {
          if (!attributes.label) return {};
          return { 'data-label': attributes.label };
        }
      },
      type: {
        default: null,
        parseHTML: element => element.getAttribute('data-type'),
        renderHTML: attributes => {
          if (!attributes.type) return {};
          return { 'data-type': attributes.type };
        }
      }
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'a',
      {
        ...HTMLAttributes,
        href: `/edit/${node.attrs.type}/${node.attrs.id}`,
        class: 'mention-chip',
        'data-id': node.attrs.id,
        'data-type': node.attrs.type,
        'data-label': node.attrs.label
      },
      `@${node.attrs.label}`
    ];
  }
});

export function MentionSuggestion(options: MentionSuggestionOptions) {
  return {
    char: '@',
    allowSpaces: true,

    items: async ({ query }: { query: string }) => {
      // This will be populated by the MentionList component
      // which fetches data using Apollo
      return [{ query }];
    },

    render: () => {
      let component: ReactRenderer<MentionListRef> | null = null;
      let popup: TippyInstance[] | null = null;

      return {
        onStart: (props: any) => {
          component = new ReactRenderer(MentionList, {
            props: {
              ...props,
              currentEntityType: options.entityType,
              currentEntityId: options.entityId,
              universeId: options.universeId,
              onMentionSelect: options.onSelect
            },
            editor: props.editor
          });

          if (!props.clientRect) return;

          popup = tippy('body', {
            getReferenceClientRect: props.clientRect,
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: 'manual',
            placement: 'bottom-start',
            theme: 'mention'
          });
        },

        onUpdate(props: any) {
          component?.updateProps({
            ...props,
            currentEntityType: options.entityType,
            currentEntityId: options.entityId,
            universeId: options.universeId,
            onMentionSelect: options.onSelect
          });

          if (!props.clientRect) return;

          popup?.[0]?.setProps({
            getReferenceClientRect: props.clientRect
          });
        },

        onKeyDown(props: any) {
          if (props.event.key === 'Escape') {
            popup?.[0]?.hide();
            return true;
          }

          return component?.ref?.onKeyDown(props) ?? false;
        },

        onExit() {
          popup?.[0]?.destroy();
          component?.destroy();
        }
      };
    }
  };
}
