import { useEffect, useRef, useState } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import {
  $getNodeByKey,
  COMMAND_PRIORITY_LOW,
  DecoratorNode,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";

export type SerializedImageNode = Spread<
  {
    src: string;
    altText: string;
    width: number;
    type: "image";
    version: 1;
  },
  SerializedLexicalNode
>;

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __altText: string;
  __width: number;

  static getType(): string {
    return "image";
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__altText, node.__width, node.__key);
  }

  constructor(src: string, altText = "", width = 420, key?: NodeKey) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__width = width;
  }

  createDOM(): HTMLElement {
    const span = document.createElement("span");
    span.className = "editor-image-wrap";
    return span;
  }

  updateDOM(): false {
    return false;
  }

  decorate(): JSX.Element {
    return (
      <ImageComponent nodeKey={this.__key} src={this.__src} altText={this.__altText} width={this.__width} />
    );
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { src, altText, width } = serializedNode;
    return new ImageNode(src, altText, width);
  }

  exportJSON(): SerializedImageNode {
    return {
      ...super.exportJSON(),
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
      type: "image",
      version: 1,
    };
  }

  setWidth(nextWidth: number): void {
    const writable = this.getWritable();
    writable.__width = nextWidth;
  }
}

export function $createImageNode(src: string, altText = ""): ImageNode {
  return new ImageNode(src, altText);
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode;
}

function ImageComponent({
  nodeKey,
  src,
  altText,
  width,
}: {
  nodeKey: NodeKey;
  src: string;
  altText: string;
  width: number;
}) {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(width);

  useEffect(() => {
    return editor.registerCommand(
      KEY_DELETE_COMMAND,
      () => {
        if (!isSelected) return false;
        editor.update(() => {
          const node = $getNodeByKey(nodeKey);
          if ($isImageNode(node)) {
            node.remove();
          }
        });
        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor, isSelected, nodeKey]);

  useEffect(() => {
    return editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      () => {
        if (!isSelected) return false;
        editor.update(() => {
          const node = $getNodeByKey(nodeKey);
          if ($isImageNode(node)) {
            node.remove();
          }
        });
        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor, isSelected, nodeKey]);

  function onImageMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (e.shiftKey) {
      setSelected(!isSelected);
      return;
    }
    clearSelection();
    setSelected(true);
  }

  function onResizeStart(e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    clearSelection();
    setSelected(true);
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;

    const onMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startXRef.current;
      const next = Math.max(140, Math.min(1000, startWidthRef.current + delta));
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isImageNode(node)) {
          node.setWidth(next);
        }
      });
    };

    const onUp = () => {
      setIsResizing(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  return (
    <div className={`editor-image-block ${isSelected ? "selected" : ""}`} onMouseDown={onImageMouseDown}>
      <img
        src={src}
        alt={altText}
        className="editor-image"
        style={{ width: `${width}px` }}
        draggable
        onDragStart={(e) => {
          clearSelection();
          setSelected(true);
          e.dataTransfer.setData("application/x-claims-image-key", String(nodeKey));
          e.dataTransfer.effectAllowed = "move";
        }}
      />
      <div
        className={`editor-image-resize-handle ${isSelected || isResizing ? "visible" : ""}`}
        title="Drag to resize"
        onMouseDown={onResizeStart}
      />
    </div>
  );
}
