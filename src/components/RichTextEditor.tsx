import React, { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

export function RichTextEditor({ value, onChange, placeholder, height = '200px' }: RichTextEditorProps) {
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean'],
      [{ 'color': [] }, { 'background': [] }]
    ],
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'script',
    'indent',
    'align',
    'link', 'image',
    'color', 'background'
  ];

  return (
    <div className="rich-text-editor-wrapper">
      <style>{`
        .rich-text-editor-wrapper .quill {
          background: white;
          border-radius: 12px;
          border: 1px solid #cbd5e1;
        }
        .rich-text-editor-wrapper .ql-toolbar {
          border-radius: 12px 12px 0 0;
          background: #f8fafc;
          border-bottom: 1px solid #cbd5e1;
        }
        .rich-text-editor-wrapper .ql-container {
          border-radius: 0 0 12px 12px;
          font-size: 14px;
          min-height: ${height};
        }
        .rich-text-editor-wrapper .ql-editor {
          min-height: ${height};
        }
        .rich-text-editor-wrapper .ql-editor.ql-blank::before {
          color: #94a3b8;
          font-style: normal;
        }
      `}</style>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
}
