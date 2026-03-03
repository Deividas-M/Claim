import { useEffect, useState } from "react";

import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { TOGGLE_LINK_COMMAND, LinkNode, $isLinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { $patchStyleText, $getSelectionStyleValueForProperty } from "@lexical/selection";
import {
  $insertNodes,
  $getNearestNodeFromDOMNode,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  $getRoot,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  $isTextNode,
} from "lexical";

import { FormField } from "./FormField";
import { $createImageNode, ImageNode } from "./lexical/ImageNode";

type Props = {
  title: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (nextStateJson: string, hasContent: boolean) => void;
  asPanel?: boolean;
};

type ToolbarState = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  isLink: boolean;
  fontSize: string;
  color: string;
  bgColor: string;
};

const theme = {
  paragraph: "editor-paragraph",
};

const defaultToolbarState: ToolbarState = {
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  isLink: false,
  fontSize: "14px",
  color: "#000000",
  bgColor: "#ffffff",
};

function extractStyleValue(style: string, key: string): string | null {
  const regex = new RegExp(`${key}\\s*:\\s*([^;]+)`);
  const match = style.match(regex);
  return match ? match[1].trim() : null;
}

function MessageEditorInner({ value, onChange, placeholder }: Omit<Props, "title" | "label" | "asPanel">) {
  const initialConfig = {
    namespace: "ClaimMessageEditor",
    theme,
    onError(error: Error) {
      throw error;
    },
    editorState: value || undefined,
    nodes: [ImageNode, ListNode, ListItemNode, LinkNode],
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-shell">
        <FloatingOutlookToolbarPlugin />
        <PasteImagePlugin />
        <DragDropImagePlugin />
        <RichTextPlugin
          contentEditable={<ContentEditable className="editor-input" />}
          placeholder={<div className="editor-placeholder">{placeholder}</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <OnChangePlugin
          onChange={(editorState) => {
            const json = JSON.stringify(editorState.toJSON());
            let hasContent = false;
            editorState.read(() => {
              const text = $getRoot().getTextContent().trim();
              const hasImage = $getRoot()
                .getChildren()
                .some((node) => node.getType() === "image");
              hasContent = Boolean(text || hasImage);
            });
            onChange(json, hasContent);
          }}
        />
      </div>
    </LexicalComposer>
  );
}

function FloatingOutlookToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [state, setState] = useState<ToolbarState>(defaultToolbarState);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const update = () => {
      const rootElement = editor.getRootElement();
      const nativeSelection = window.getSelection();
      if (!rootElement || !nativeSelection || nativeSelection.rangeCount === 0) {
        setIsVisible(false);
        return;
      }
      if (nativeSelection.isCollapsed) {
        setIsVisible(false);
        return;
      }
      const range = nativeSelection.getRangeAt(0);
      const selectedNode = range.commonAncestorContainer;
      if (!selectedNode || !rootElement.contains(selectedNode)) {
        setIsVisible(false);
        return;
      }

      const rect = range.getBoundingClientRect();
      setPosition({
        top: Math.max(8, rect.top - 52),
        left: Math.max(16, rect.left + rect.width / 2),
      });
      setIsVisible(true);

      editor.getEditorState().read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || selection.isCollapsed()) {
          setState(defaultToolbarState);
          return;
        }

        const color = $getSelectionStyleValueForProperty(selection, "color", "#000000");
        const bgColor = $getSelectionStyleValueForProperty(
          selection,
          "background-color",
          "#ffffff"
        );
        const fontSize = $getSelectionStyleValueForProperty(selection, "font-size", "14px");

        const nodes = selection.getNodes();
        const isLink = nodes.some((node) => {
          const parent = node.getParent();
          return $isLinkNode(node) || (parent ? $isLinkNode(parent) : false);
        });

        setState({
          bold: selection.hasFormat("bold"),
          italic: selection.hasFormat("italic"),
          underline: selection.hasFormat("underline"),
          strikethrough: selection.hasFormat("strikethrough"),
          isLink,
          fontSize,
          color,
          bgColor,
        });
      });
    };

    const unregisterUpdate = editor.registerUpdateListener(() => {
      update();
    });
    const unregisterSelection = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        requestAnimationFrame(update);
        return false;
      },
      COMMAND_PRIORITY_LOW
    );
    const onSelectionChange = () => requestAnimationFrame(update);
    document.addEventListener("selectionchange", onSelectionChange);

    return () => {
      unregisterUpdate();
      unregisterSelection();
      document.removeEventListener("selectionchange", onSelectionChange);
    };
  }, [editor]);

  function onFormat(format: "bold" | "italic" | "underline" | "strikethrough") {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  }

  function onFontSize(next: string) {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, { "font-size": next });
      }
    });
  }

  function onColor(next: string) {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, { color: next });
      }
    });
  }

  function onHighlight(next: string) {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, { "background-color": next });
      }
    });
  }

  function onToggleLink() {
    if (state.isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
      return;
    }
    const url = window.prompt("Enter URL");
    if (!url) return;
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
  }

  function onClearFormatting() {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      $patchStyleText(selection, {
        color: "",
        "background-color": "",
        "font-size": "",
      });
      selection.getNodes().forEach((node) => {
        if ($isTextNode(node)) {
          node.setFormat(0);
          node.setStyle("");
        }
      });
    });
  }

  if (!isVisible) return null;

  return (
    <div className="floating-toolbar" style={{ top: `${position.top}px`, left: `${position.left}px` }}>
      <button type="button" className={`icon-btn ${state.bold ? "active" : ""}`} title="Bold" onMouseDown={(e) => e.preventDefault()} onClick={() => onFormat("bold")}><span className="ico-bold">B</span></button>
      <button type="button" className={`icon-btn ${state.italic ? "active" : ""}`} title="Italic" onMouseDown={(e) => e.preventDefault()} onClick={() => onFormat("italic")}><span className="ico-italic">I</span></button>
      <button type="button" className={`icon-btn ${state.underline ? "active" : ""}`} title="Underline" onMouseDown={(e) => e.preventDefault()} onClick={() => onFormat("underline")}><span className="ico-underline">U</span></button>
      <button type="button" className={`icon-btn ${state.strikethrough ? "active" : ""}`} title="Strikethrough" onMouseDown={(e) => e.preventDefault()} onClick={() => onFormat("strikethrough")}><span className="ico-strike">S</span></button>
      <button type="button" className={`icon-btn ${state.isLink ? "active" : ""}`} title="Link" onMouseDown={(e) => e.preventDefault()} onClick={onToggleLink}>🔗</button>
      <select className="mini-select" value={state.fontSize} title="Font size" onChange={(e) => onFontSize(e.target.value)}>
        <option value="12px">12</option>
        <option value="14px">14</option>
        <option value="16px">16</option>
        <option value="18px">18</option>
        <option value="20px">20</option>
      </select>
      <input className="mini-color" type="color" value={state.color} title="Text color" onChange={(e) => onColor(e.target.value)} />
      <input className="mini-color" type="color" value={state.bgColor} title="Highlight" onChange={(e) => onHighlight(e.target.value)} />
      <button type="button" className="icon-btn" title="Clear formatting" onMouseDown={(e) => e.preventDefault()} onClick={onClearFormatting}>Tx</button>
    </div>
  );
}

function PasteImagePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;
      const imageItems = Array.from(items).filter((item) => item.type.startsWith("image/"));
      if (imageItems.length === 0) return;

      event.preventDefault();
      imageItems.forEach((item) => {
        const file = item.getAsFile();
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          const src = typeof reader.result === "string" ? reader.result : "";
          if (!src) return;
          editor.update(() => {
            $insertNodes([$createImageNode(src, file.name)]);
          });
        };
        reader.readAsDataURL(file);
      });
    };

    return editor.registerRootListener((root, prevRoot) => {
      if (prevRoot) {
        prevRoot.removeEventListener("paste", onPaste);
      }
      if (root) {
        root.addEventListener("paste", onPaste);
      }
    });
  }, [editor]);

  return null;
}

function DragDropImagePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const onDragOver = (event: DragEvent) => {
      const key = event.dataTransfer?.getData("application/x-claims-image-key");
      if (!key) return;
      event.preventDefault();
      event.dataTransfer!.dropEffect = "move";
    };

    const onDrop = (event: DragEvent) => {
      const draggedKey = event.dataTransfer?.getData("application/x-claims-image-key");
      if (!draggedKey) return;
      event.preventDefault();

      const targetDom = event.target as HTMLElement | null;
      const dropY = event.clientY;

      editor.update(() => {
        const draggedNode = $getNodeByKey(draggedKey);
        if (!draggedNode) return;
        const draggedTop = draggedNode.getTopLevelElementOrThrow();

        const targetLexicalNode = targetDom ? $getNearestNodeFromDOMNode(targetDom) : null;
        if (!targetLexicalNode) {
          return;
        }

        const targetTop = targetLexicalNode.getTopLevelElementOrThrow();
        if (targetTop.getKey() === draggedTop.getKey()) {
          return;
        }

        const targetElement = editor.getElementByKey(targetTop.getKey());
        if (!targetElement) {
          targetTop.insertAfter(draggedTop);
          return;
        }

        const rect = targetElement.getBoundingClientRect();
        const insertAfter = dropY > rect.top + rect.height / 2;
        if (insertAfter) {
          targetTop.insertAfter(draggedTop);
        } else {
          targetTop.insertBefore(draggedTop);
        }
      });
    };

    return editor.registerRootListener((root, prevRoot) => {
      if (prevRoot) {
        prevRoot.removeEventListener("dragover", onDragOver);
        prevRoot.removeEventListener("drop", onDrop);
      }
      if (root) {
        root.addEventListener("dragover", onDragOver);
        root.addEventListener("drop", onDrop);
      }
    });
  }, [editor]);

  return null;
}

export function MessageEditor({
  asPanel = true,
  title,
  label,
  placeholder,
  value,
  onChange,
}: Props) {
  const body = (
    <>
      <h3>{title}</h3>
      <FormField label={label} asLabel={false}>
        <MessageEditorInner value={value} onChange={onChange} placeholder={placeholder} />
      </FormField>
      <FormField label="Add files (optional)">
        <input type="file" multiple />
      </FormField>
    </>
  );

  if (asPanel) {
    return <section className="subpanel stack">{body}</section>;
  }
  return <div className="stack">{body}</div>;
}
