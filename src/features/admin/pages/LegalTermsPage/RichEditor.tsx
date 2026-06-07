import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { useEffect } from "react";
import {
  RiBold, RiItalic, RiUnderline, RiStrikethrough,
  RiListUnordered, RiListOrdered,
  RiAlignLeft, RiAlignCenter, RiAlignRight,
  RiH1, RiH2, RiH3,
  RiSeparator,
  RiFormatClear,
} from "react-icons/ri";

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  hasError?: boolean;
}

const ToolbarBtn = ({
  active = false,
  disabled = false,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    disabled={disabled}
    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors disabled:opacity-30 ${
      active
        ? "bg-primary text-white"
        : "text-text-muted hover:bg-bg-subtle hover:text-text"
    }`}
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-5 bg-border mx-0.5 self-center" />;

export function RichEditor({ value, onChange, hasError }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[220px] px-4 py-3 text-text focus:outline-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h1]:text-2xl [&_h1]:font-black [&_h2]:text-xl [&_h2]:font-black [&_h3]:text-lg [&_h3]:font-bold [&_p]:my-1",
      },
    },
  });

  // Sync external value changes (e.g. when modal opens with existing term)
  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value || "", false);
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div
      className={`rounded-xl border bg-bg-subtle overflow-hidden focus-within:border-primary transition-colors ${
        hasError ? "border-danger" : "border-border"
      }`}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-2 border-b border-border bg-card">
        {/* Headings */}
        <ToolbarBtn
          title="Título 1"
          active={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <RiH1 />
        </ToolbarBtn>
        <ToolbarBtn
          title="Título 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <RiH2 />
        </ToolbarBtn>
        <ToolbarBtn
          title="Título 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <RiH3 />
        </ToolbarBtn>

        <Divider />

        {/* Inline marks */}
        <ToolbarBtn
          title="Negrito"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <RiBold />
        </ToolbarBtn>
        <ToolbarBtn
          title="Itálico"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <RiItalic />
        </ToolbarBtn>
        <ToolbarBtn
          title="Sublinhado"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <RiUnderline />
        </ToolbarBtn>
        <ToolbarBtn
          title="Tachado"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <RiStrikethrough />
        </ToolbarBtn>

        <Divider />

        {/* Lists */}
        <ToolbarBtn
          title="Lista com marcadores"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <RiListUnordered />
        </ToolbarBtn>
        <ToolbarBtn
          title="Lista numerada"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <RiListOrdered />
        </ToolbarBtn>

        <Divider />

        {/* Alignment */}
        <ToolbarBtn
          title="Alinhar à esquerda"
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <RiAlignLeft />
        </ToolbarBtn>
        <ToolbarBtn
          title="Centralizar"
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <RiAlignCenter />
        </ToolbarBtn>
        <ToolbarBtn
          title="Alinhar à direita"
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <RiAlignRight />
        </ToolbarBtn>

        <Divider />

        {/* Extras */}
        <ToolbarBtn
          title="Linha separadora"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <RiSeparator />
        </ToolbarBtn>
        <ToolbarBtn
          title="Limpar formatação"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        >
          <RiFormatClear />
        </ToolbarBtn>

        {/* Font color */}
        <div className="flex items-center gap-1 ml-0.5" title="Cor do texto">
          <input
            type="color"
            className="w-7 h-7 rounded cursor-pointer border border-border bg-transparent p-0.5"
            value={editor.getAttributes("textStyle").color ?? "#000000"}
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          />
        </div>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />
    </div>
  );
}
