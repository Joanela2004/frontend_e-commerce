// src/components/editor/TiptapEditor.jsx
import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';

import {
  FaBold, FaItalic, FaUnderline, FaListUl, FaListOl,
  FaAlignLeft, FaAlignCenter, FaAlignRight, FaLink, FaImage
} from 'react-icons/fa';
import "../../../styles/back-office/article.css";
const TiptapEditor = ({ content, onUpdate }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class: 'tiptap-editor prose prose-lg max-w-none focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
  });

  if (!editor) return null;


const handleImage = () => {
  const url = window.prompt('URL de l\'image :', 'https://');
  if (url) {
    editor?.chain().focus().setImage({ src: url }).run();
  }
};

const handleLink = () => {
  const previousUrl = editor?.getAttributes('link').href || 'https://';
  const url = window.prompt('URL du lien :', previousUrl);

  if (url === null) return;
  if (url === '') {
    editor?.chain().focus().unsetLink().run();
    return;
  }
  editor?.chain().focus().setLink({ href: url }).run();
};

  return (
    <div className="tiptap-container">
      <div className="tiptap-toolbar">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''}>
          <FaBold />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active' : ''}>
          <FaItalic />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'is-active' : ''}>
          <FaUnderline />
        </button>

        <select
          onChange={(e) => {
            const value = e.target.value;
            if (value === 'p') editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: parseInt(value) }).run();
          }}
          value={editor.isActive('heading', { level: 1 }) ? '1' : editor.isActive('heading', { level: 2 }) ? '2' : editor.isActive('heading', { level: 3 }) ? '3' : 'p'}
        >
          <option value="p">Paragraphe</option>
          <option value="1">Titre 1</option>
          <option value="2">Titre 2</option>
          <option value="3">Titre 3</option>
        </select>

        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'is-active' : ''}>
          <FaListUl />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'is-active' : ''}>
          <FaListOl />
        </button>

        <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}>
          <FaAlignLeft />
        </button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}>
          <FaAlignCenter />
        </button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}>
          <FaAlignRight />
        </button>

       <button type="button" onClick={handleImage}>
  <FaImage />
</button>

<button type="button" onClick={handleLink} className={editor?.isActive('link') ? 'is-active' : ''}>
  <FaLink />
</button>

        <input
          type="color"
          onInput={(e) => editor.chain().focus().setColor(e.target.value).run()}
          value={editor.getAttributes('textStyle').color || '#000000'}
          title="Couleur du texte"
        />
      </div>

      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;