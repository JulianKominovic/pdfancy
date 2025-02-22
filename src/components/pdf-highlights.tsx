import React, { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/popover";
import { Button, ButtonGroup } from "@heroui/button";
import { Copy } from "lucide-react";

import {
  CategoryFileHighlight,
  FolderFile,
  useFoldersStore,
} from "@/stores/folders";
import {
  recursiveFindNodeByCondition,
  recursiveFindChildrenIndex,
} from "@/utils/dom";
import loggers from "@/utils/loggers";

type PdfHighlightsProps = {
  folderId: string;
  folderFile: FolderFile;
  readerRef: React.RefObject<HTMLDivElement>;
  pagesLoaded: boolean;
};

const PdfHighlights = ({
  folderId,
  folderFile,
  readerRef,
  pagesLoaded,
}: PdfHighlightsProps) => {
  const [selectionRange, setSelectionRange] = useState<{
    start: CategoryFileHighlight["start"];
    end: CategoryFileHighlight["end"];
    clientRects: DOMRect[];
  } | null>(null);

  const addOrSetHighlight = useFoldersStore((state) => state.addOrSetHighlight);
  useEffect(() => {
    window.addEventListener("pointerup", () => {
      const selectedText = window.getSelection();
      // const start = selectedText?.anchorOffset;
      // const end = selectedText?.focusOffset;
      const selectionIsInsidePdf = document
        .querySelector("[data-text-reader]")
        ?.contains(selectedText?.anchorNode as Node);

      if (
        selectedText &&
        selectedText.toString().length > 0 &&
        selectionIsInsidePdf
      ) {
        const rects = selectedText.getRangeAt(0).getClientRects();
        if (rects.length > 0) {
          const startNode = recursiveFindNodeByCondition(
            selectedText.anchorNode as Node,
            (node) =>
              node instanceof HTMLElement &&
              node.hasAttribute("data-page-number")
          ) as HTMLElement | null;
          const endNode = recursiveFindNodeByCondition(
            selectedText.focusNode as Node,
            (node) =>
              node instanceof HTMLElement &&
              node.hasAttribute("data-page-number")
          ) as HTMLElement | null;
          if (!startNode || !endNode) return;
          const startPageNode = startNode?.querySelector(
            ".react-pdf__Page__textContent"
          );
          const endPageNode = endNode?.querySelector(
            ".react-pdf__Page__textContent"
          );
          const startChildrenIndex: number = recursiveFindChildrenIndex(
            startPageNode as Node,
            selectedText.anchorNode as Node
          );
          const endChildrenIndex: number = recursiveFindChildrenIndex(
            endPageNode as Node,
            selectedText.focusNode as Node
          );

          if (startChildrenIndex === -1 || endChildrenIndex === -1) return;

          setSelectionRange({
            clientRects: Array.from(rects),
            start: {
              pageIndex: Number(startNode.getAttribute("data-page-number")) - 1,
              childrenIndex: startChildrenIndex,
              offset: selectedText.anchorOffset,
            },
            end: {
              pageIndex: Number(endNode.getAttribute("data-page-number")) - 1,
              childrenIndex: endChildrenIndex,
              offset: selectedText.focusOffset,
            },
          });
        }
        loggers.layers.component(
          "selectedText",
          selectedText,
          selectedText.toString()
        );
      } else {
        setSelectionRange(null);
      }
    });
  }, []);
  if (!pagesLoaded) return null;
  return (
    <>
      {/* {Object.values(folderFile.highlights).flatMap((highlight) => {
        const { start, end } = highlight;
        const startPageElement = document.querySelector(
          `[data-page-number="${start.pageIndex + 1}"] .react-pdf__Page__textContent`
        );
        const endPageElement = document.querySelector(
          `[data-page-number="${end.pageIndex + 1}"] .react-pdf__Page__textContent`
        );
        console.log("[HIGHLIGHTS]", "Getting page elements", {
          startPageElement,
          endPageElement,
        });
        if (!startPageElement || !endPageElement) return null;
        const startNode = startPageElement.childNodes[
          start.childrenIndex
        ] as HTMLElement;
        const endNode = endPageElement.childNodes[
          end.childrenIndex
        ] as HTMLElement;

        console.log("[HIGHLIGHTS]", "Getting node children", {
          startNode,
          endNode,
        });
        if (!startNode || !endNode) return null;
        const startTextNode =
          startNode instanceof Text ? startNode : startNode.firstChild;
        const endTextNode =
          endNode instanceof Text ? endNode : endNode.firstChild;

        console.log("[HIGHLIGHTS]", "Getting text nodes", {
          startTextNode,
          endTextNode,
        });

        if (!startTextNode || !endTextNode) return null;

        console.log("[HIGHLIGHTS]", "Creating range", {
          startTextNode,
          endTextNode,
          startOffset: start.offset,
          endOffset: end.offset,
          startNodeLength: startTextNode.textContent!.length,
          endNodeLength: endTextNode.textContent!.length,
        });
        const range = document.createRange();
        range.setStart(startTextNode, start.offset);
        if (range.comparePoint(endTextNode, end.offset) === 1) {
          range.setEnd(endTextNode, end.offset);
        } else {
          range.setStart(endTextNode, end.offset);
          range.setEnd(startTextNode, start.offset);
        }
        const rects = range.getClientRects();

        if (rects.length === 0) return null;

        // Rects which are over the same element should be deduped
        let alreadySeen = new Set<Node>();
        const dedupedRects = Array.from(rects).filter((r) => {
          const element = document.elementFromPoint(r.left, r.top);
          if (element && !alreadySeen.has(element)) {
            alreadySeen.add(element);
            return true;
          }
          return false;
        });
        return dedupedRects.map((rect, i) => {
          return (
            <button
              key={highlight.id + "s" + i}
              className="absolute z-10 rounded-lg pointer-events-none"
              style={{
                width: rect.width,
                height: rect.height,
                top:
                  rect.top +
                  document.querySelector(".react-pdf__Document")!.scrollTop,
                left:
                  rect.left -
                  document
                    .querySelector(".react-pdf__Document")!
                    .getBoundingClientRect().x +
                  readerRef.current!.scrollLeft,
                backgroundColor: "rgba(255, 0, 255, 0.327)",
              }}
            />
          );
        });
      })} */}
      {folderId &&
        folderFile.id &&
        selectionRange &&
        selectionRange.clientRects.length > 0 &&
        readerRef.current &&
        selectionRange.clientRects.map((rect, index) => {
          const style = {
            width: rect.width,
            height: rect.height,
            top:
              rect.top +
              document.querySelector(".react-pdf__Document")!.scrollTop,
            left:
              rect.left -
              readerRef.current!.getBoundingClientRect().x +
              readerRef.current!.scrollLeft,
            backgroundColor: "rgba(255, 0, 255, 0.327)",
          };

          return index === 0 ? (
            <Popover
              onClose={() => {
                setSelectionRange(null);
              }}
              defaultOpen
              shouldCloseOnBlur
              shouldCloseOnInteractOutside={() => true}
              placement="bottom"
              key={"highlight" + index}
            >
              <PopoverTrigger>
                <div
                  className="absolute z-10 pointer-events-none"
                  style={style}
                />
              </PopoverTrigger>

              <PopoverContent
                as={ButtonGroup}
                className="flex flex-row items-center w-full h-full p-0 overflow-hidden bg-primary-300 shadow-large rounded-xl"
              >
                <Button
                  onPress={() => {
                    const { start, end } = selectionRange;
                    if (
                      start.pageIndex >= 0 &&
                      end.pageIndex >= 0 &&
                      start.childrenIndex !== -1 &&
                      end.childrenIndex !== -1
                    ) {
                      // Find the closes element data-page-number
                      addOrSetHighlight(folderId, folderFile.id!, {
                        color: "#333",
                        start: {
                          offset: selectionRange.start.offset,
                          pageIndex: start.pageIndex,
                          childrenIndex: start.childrenIndex,
                        },
                        end: {
                          offset: selectionRange.end.offset,
                          pageIndex: end.pageIndex,
                          childrenIndex: end.childrenIndex,
                        },
                        reflections: [],
                        text: window.getSelection()?.toString() || "",
                      });
                    }
                  }}
                  className="min-w-0 text-primary-800 bg-primary-300"
                >
                  Add to highlights
                </Button>
                <Button className="min-w-0 text-primary-800 bg-primary-300">
                  <Copy size={14} />
                </Button>
              </PopoverContent>
            </Popover>
          ) : (
            <div
              key={"highlight" + index}
              className="absolute z-10 pointer-events-none"
              style={style}
            />
          );
        })}
    </>
  );
};

export default PdfHighlights;
