import { useState, cloneElement, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/popover";
import { Button } from "@heroui/button";

import loggers from "@/utils/loggers";
import { createPortal } from "react-dom";

type TextSelectionProps = {
  //   onSelection?: (selection: Selection) => void;
  //   children?: React.ReactNode;
  querySelector: string;
  popover: ({ styles }: { styles: React.CSSProperties }) => React.ReactNode;
};
// & (
//   | {
//   children?: React.ReactNode;
//   querySelector?: undefined;
// }
//   | {
//       children?: undefined;
//       querySelector: string;
//     }
// );

const TextSelectionPopover = ({
  popover,
  //   onSelection,
  querySelector,
}: TextSelectionProps) => {
  const [clientRects, setClientRects] = useState<DOMRect[]>([]);
  const [element, setElement] = useState<HTMLElement | null>(
    document.querySelector(querySelector) as HTMLElement | null
  );
  function handleSelection() {
    const selectedText = window.getSelection();
    // const start = selectedText?.anchorOffset;
    // const end = selectedText?.focusOffset;

    if (selectedText && selectedText.toString().length > 0) {
      const range = document.createRange();
      range.setStart(
        selectedText.anchorNode as Node,
        selectedText.anchorOffset
      );
      range.setEnd(selectedText.focusNode as Node, selectedText.focusOffset);
      console.log("Ranges", range.getClientRects());
      const rects = range.getClientRects();
      if (rects.length > 0) {
        setClientRects(Array.from(rects));
      }
      loggers.layers.component(
        "selectedText",
        selectedText,
        selectedText.toString()
      );
    } else {
      setClientRects([]);
    }
  }
  console.log("element", element);
  useEffect(() => {
    requestIdleCallback(() => {
      const el = document.querySelector(querySelector);
      if (el instanceof HTMLElement) {
        setElement(el);
        el.addEventListener("pointerup", handleSelection);
      }
    });
    return () => {
      element?.removeEventListener("pointerup", handleSelection);
    };
  }, [querySelector]);

  return clientRects.length > 0 && element instanceof HTMLElement
    ? (createPortal(
        <Popover placement="right">
          <PopoverTrigger>
            <div className="absolute top-0 left-0">
              {clientRects.map((rect, index) => (
                <Button
                  key={index + "temp-rect"}
                  style={{
                    position: "absolute",
                    top: rect.y + element.scrollTop,
                    left: rect.x,
                    backgroundColor: "rgba(0,0,0,.6)",
                    zIndex: 50,
                    width: rect.width,
                    height: rect.height,
                  }}
                />
              ))}
            </div>
          </PopoverTrigger>
          <PopoverContent>
            <div className="px-1 py-2">
              <div className="font-bold text-small">Popover Content</div>
              <div className="text-tiny">This is the popover content</div>
            </div>
          </PopoverContent>
        </Popover>,
        element as HTMLElement
      ) as any)
    : null;
};

TextSelectionPopover.displayName = "TextSelectionPopover";

export default TextSelectionPopover;
