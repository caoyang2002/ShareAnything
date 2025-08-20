'use client';

import { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { User } from '@/types';
import { AnyARecord } from 'dns';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  onCursorChange: (line: number, column: number) => void;
  language: string;
  users: User[];
  readOnly?: boolean;
}

export default function CodeEditor({
  value,
  onChange,
  onCursorChange,
  language,
  users,
  readOnly = false,
}: CodeEditorProps) {
  const editorRef = useRef<any>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    setIsEditorReady(true);

    // 监听光标位置变化
    editor.onDidChangeCursorPosition((e: any) => {
      onCursorChange(e.position.lineNumber, e.position.column);
    });

    // 配置编辑器
    editor.updateOptions({
      fontSize: 14,
      tabSize: 2,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      automaticLayout: true,
    });
  };

  const handleChange = (newValue: string | undefined) => {
    if (newValue !== undefined && !readOnly) {
      onChange(newValue);
    }
  };

  // 显示其他用户的光标
  useEffect(() => {
    if (!isEditorReady || !editorRef.current) return;

    const editor = editorRef.current;
    const decorations: any[] = [];

    users.forEach((user) => {
      if (user.cursor) {
        decorations.push({
          range: {
            startLineNumber: user.cursor.line,
            startColumn: user.cursor.column,
            endLineNumber: user.cursor.line,
            endColumn: user.cursor.column + 1,
          },
          options: {
            className: 'user-cursor',
            before: {
              content: user.name,
              inlineClassName: 'user-cursor-label',
              inlineClassNameAffectsLetterSpacing: true,
            },
            blockClassName: 'user-cursor-block',
          },
        });
      }
    });

    const decorationIds = editor.deltaDecorations([], decorations);

    return () => {
      if (editor && decorationIds) {
        editor.deltaDecorations(decorationIds, []);
      }
    };
  }, [users, isEditorReady]);

  return (
    <div className="h-full border rounded-lg overflow-hidden">
      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          theme: 'vs-dark',
          automaticLayout: true,
        }}
      />
    </div>
  );
}