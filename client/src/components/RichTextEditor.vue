<template>
  <div class="rich-text-editor">
    <div class="toolbar" v-if="editor">
      <button
        class="toolbar-btn"
        :class="{ 'is-active': editor.isActive('bold') }"
        @click="editor.chain().focus().toggleBold().run()"
      >
        <strong>B</strong>
      </button>
      <button
        class="toolbar-btn"
        :class="{ 'is-active': editor.isActive('italic') }"
        @click="editor.chain().focus().toggleItalic().run()"
      >
        <em>I</em>
      </button>
      <button
        class="toolbar-btn"
        :class="{ 'is-active': editor.isActive('underline') }"
        @click="editor.chain().focus().toggleUnderline().run()"
      >
        <span style="text-decoration: underline">U</span>
      </button>
      <button
        class="toolbar-btn"
        :class="{ 'is-active': editor.isActive('strike') }"
        @click="editor.chain().focus().toggleStrike().run()"
      >
        <span style="text-decoration: line-through">S</span>
      </button>
      <div class="separator"></div>
      <button
        class="toolbar-btn"
        :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
      >
        H1
      </button>
      <button
        class="toolbar-btn"
        :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        H2
      </button>
      <button
        class="toolbar-btn"
        :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
      >
        H3
      </button>
      <div class="separator"></div>
      <button
        class="toolbar-btn"
        :class="{ 'is-active': editor.isActive('bulletList') }"
        @click="editor.chain().focus().toggleBulletList().run()"
      >
        ul
      </button>
      <button
        class="toolbar-btn"
        :class="{ 'is-active': editor.isActive('orderedList') }"
        @click="editor.chain().focus().toggleOrderedList().run()"
      >
        ol
      </button>
      <div class="separator"></div>
      <button
        class="toolbar-btn"
        :class="{ 'is-active': editor.isActive('blockquote') }"
        @click="editor.chain().focus().toggleBlockquote().run()"
      >
        ❝
      </button>
      <button
        class="toolbar-btn"
        :class="{ 'is-active': editor.isActive('codeBlock') }"
        @click="editor.chain().focus().toggleCodeBlock().run()"
      >
        &lt;/&gt;
      </button>
    </div>
    <EditorContent :editor="editor" class="editor-content" />
  </div>
</template>

<script setup>
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Placeholder from '@tiptap/extension-placeholder'
import { common, createLowlight } from 'lowlight'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const lowlight = createLowlight(common)

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      codeBlock: false
    }),
    Underline,
    CodeBlockLowlight.configure({
      lowlight
    }),
    Placeholder.configure({
      placeholder: '开始书写你的文章...'
    })
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  }
})
</script>

<style lang="scss" scoped>
.rich-text-editor {
  border-radius: 8px;
  overflow: hidden;
}

.toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
  padding: 8px 12px;
  background: rgba(62, 50, 38, 0.9);
  border: 1px solid rgba(212, 165, 116, 0.2);
  border-bottom: 1px solid rgba(212, 165, 116, 0.2);
  border-radius: 8px 8px 0 0;
}

.toolbar-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  font-size: 14px;
  color: var(--color-ash);
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1;

  &:hover {
    color: var(--color-amber-glow);
    background: rgba(212, 165, 116, 0.15);
  }

  &.is-active {
    color: var(--color-amber-glow);
    background: rgba(212, 165, 116, 0.2);
  }
}

.separator {
  width: 1px;
  height: 20px;
  background: rgba(212, 165, 116, 0.2);
  margin: 0 4px;
}

.editor-content {
  background: rgba(45, 36, 24, 0.6);
  border: 1px solid rgba(212, 165, 116, 0.2);
  border-top: none;
  border-radius: 0 0 8px 8px;
  min-height: 300px;

  :deep(.tiptap) {
    min-height: 300px;
    padding: 20px;
    color: var(--color-moonlight);
    font-size: 15px;
    line-height: 1.8;
    outline: none;

    &:focus {
      outline: none;
    }

    p.is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      float: left;
      color: var(--color-ash);
      pointer-events: none;
      height: 0;
    }

    h1, h2, h3 {
      color: var(--color-candle);
    }

    h1 {
      font-size: 1.8em;
      font-weight: 700;
    }

    h2 {
      font-size: 1.4em;
      font-weight: 600;
    }

    h3 {
      font-size: 1.2em;
      font-weight: 600;
    }

    pre {
      background: rgba(30, 24, 18, 0.8);
      border-radius: 4px;
      padding: 12px 16px;
      font-family: monospace;

      code {
        background: none;
        padding: 0;
        border-radius: 0;
        color: inherit;
        font-size: inherit;
      }
    }

    blockquote {
      border-left: 3px solid var(--color-amber-glow);
      padding-left: 16px;
      color: var(--color-ash);
      font-style: italic;
    }

    ul, ol {
      padding-left: 1.5em;
    }

    code {
      background: rgba(30, 24, 18, 0.8);
      border-radius: 4px;
      padding: 2px 6px;
      font-family: monospace;
      font-size: 0.9em;
    }
  }
}
</style>
