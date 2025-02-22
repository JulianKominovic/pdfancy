// // @ts-nocheck

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { memo, useEffect, useRef, useState } from "react";
import { Document, Outline, Page } from "react-pdf";
import { PDFDocumentProxy } from "pdfjs-dist";
import { Skeleton } from "@heroui/skeleton";
import { List as VList } from "react-virtualized";
import { Tabs, Tab } from "@heroui/tabs";
import { Tooltip } from "@heroui/tooltip";
import { Button, ButtonGroup } from "@heroui/button";
import { Copy, Trash } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Card } from "@heroui/card";

import {
  CategoryFileHighlight,
  FolderFile,
  useFoldersStore,
} from "@/stores/folders";
import loggers from "@/utils/loggers";
import { useDebounceFunction } from "@/hooks/use-debounce-fn";
import {
  getCssSelectorForTextNode,
  getElementFromCssSelectorAndChildrenIndex,
  recursiveFindChildrenIndex,
  recursiveFindNodeByCondition,
} from "@/utils/dom";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/popover";
import PdfHighlights from "./pdf-highlights";

const PdfViewer = ({
  file,
  folderFile,
  folderId,
}: {
  file: File;
  folderFile: FolderFile;
  folderId: string;
}) => {
  const [pagesSizes, setPagesSizes] = useState<
    {
      width: number;
      height: number;
    }[]
  >([]);
  const pagesLoaded = useRef(0);
  const [loadedCompletely, setLoadedCompletely] = useState(false);
  const [scrollRestored, setScrollRestored] = useState(false);
  const [scale, _setScale] = useState(1);
  const updateFile = useFoldersStore((s) => s.updateFile);
  const addOrSetHighlight = useFoldersStore((s) => s.addOrSetHighlight);
  const [doc, setDoc] = useState<PDFDocumentProxy | null>();
  const readerRef = useRef<HTMLDivElement>(null);

  // const [highlights, setHighlights] = useState<
  //   {
  //     startNode: Node;
  //     endNode: Node;
  //     startOffset: number;
  //     endOffset: number;
  //     clientRects: DOMRect[];
  //   }[]
  // >([]);
  const numPages = doc?.numPages;

  const [width, setWidth] = useState<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  // const vlistRef = useRef<VList | null>(null);
  const { debounce } = useDebounceFunction(100);
  const { debounce: updateFileDebounced } = useDebounceFunction(300);
  const deleteHighlight = useFoldersStore((s) => s.deleteHighlight);

  function onItemClick({ pageNumber }: { pageNumber: number }) {
    // if (vlistRef.current) {
    //   vlistRef.current?.scrollToRow(pageNumber - 1);
    // }
    document.querySelector(`#p${pageNumber}`)?.scrollIntoView({
      behavior: "instant",
      block: "center",
    });
    // updateExistingHighlights();
  }

  // function updateExistingHighlights() {
  //   setHighlights(
  //     Object.values(folderFile.highlights)
  //       .map((h) => {
  //         const startNode = getElementFromCssSelectorAndChildrenIndex(
  //           h.start.selector,
  //           h.start.childrenIndex
  //         );
  //         const endNode = getElementFromCssSelectorAndChildrenIndex(
  //           h.end.selector,
  //           h.end.childrenIndex
  //         );

  //         if (!startNode || !endNode) return null;
  //         const range = document.createRange();
  //         try {
  //           range.setStart(startNode, h.start.offset);
  //           range.setEnd(endNode, h.end.offset);
  //         } catch (err) {
  //           console.log("Error updating highlight " + h.id, err, {
  //             startNode,
  //             endNode,
  //             startOffset: h.start.offset,
  //             endOffset: h.end.offset,
  //           });
  //         }
  //         if (!startNode || !endNode) return null;
  //         const rects = range.getClientRects();
  //         if (rects.length > 0) {
  //           return {
  //             ...h,
  //             clientRects: Array.from(rects),
  //             startNode,
  //             endNode,
  //             startOffset: h.start.offset,
  //             endOffset: h.end.offset,
  //           };
  //         }
  //         return null;
  //       })
  //       .filter((h) => h !== null)
  //   );
  // }

  useEffect(() => {
    // Put a resize observer on the wrapper to get the width of the document
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        debounce(() => {
          setWidth(width);
          // if (vlistRef.current) {
          //   vlistRef.current?.recomputeRowHeights();
          // }
        });
      }
    });

    if (wrapperRef.current) {
      setWidth(wrapperRef.current.getBoundingClientRect().width);
      resizeObserver.observe(wrapperRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);
  console.log("loadedCompletely", loadedCompletely);
  return (
    <div
      className="relative flex justify-between h-full gap-8 overflow-hidden"
      data-text-reader="true"
      ref={readerRef}
    >
      <Document
        inputRef={wrapperRef}
        className={
          "h-full overflow-y-auto relative mx-auto overflow-x-hidden flex-grow max-w-screen-md"
        }
        file={file}
        onLoadSuccess={async (d) => {
          setDoc(d);
          const numPages = d.numPages;
          const pagesSizes = new Array(numPages).fill(0);
          for (let index = 0; index < numPages; index++) {
            const page = await d.getPage(index + 1);
            const viewport = page.getViewport({ scale });
            pagesSizes[index] = {
              width: viewport.width,
              height: viewport.height,
            };
          }
          setPagesSizes(pagesSizes);
        }}
        loading={<Skeleton className="w-full h-full rounded-lg" />}
      >
        <PdfHighlights
          folderId={folderId}
          folderFile={folderFile}
          readerRef={readerRef}
          pagesLoaded={loadedCompletely}
        />
        {
          numPages &&
            width &&
            pagesSizes.length === numPages &&
            Array.from({ length: numPages }).map((_, index) => (
              <MemoizedPage
                onRenderTextLayerSuccess={() => {
                  pagesLoaded.current++;
                  console.log("Loaded page", pagesLoaded.current);
                  setLoadedCompletely(pagesLoaded.current >= numPages);
                }}
                key={`page-${index + 1}`}
                index={index}
                width={width}
              />
            ))
          //  (
          // @ts-ignore
          // <VList
          //   ref={vlistRef}
          //   scrollTop={
          //     scrollRestored ? undefined : folderFile?.scrollPosition || 0
          //   }
          //   width={width}
          //   height={wrapperRef.current?.clientHeight || 0}
          //   rowCount={numPages}
          //   onRowsRendered={() => {
          //     if (scrollRestored) return;
          //     setScrollRestored(true);
          //   }}
          //   onScroll={({ scrollTop }) => {
          //     // updateExistingHighlights();

          //     // Update selection highlight positions
          //     if (selectionRange) {
          //       const clientRects = document.createRange();
          //       clientRects.setStart(
          //         selectionRange.startNode,
          //         selectionRange.startOffset
          //       );
          //       clientRects.setEnd(
          //         selectionRange.endNode,
          //         selectionRange.endOffset
          //       );
          //       const rects = clientRects.getClientRects();

          //       if (rects.length > 0) {
          //         setSelectionRange({
          //           ...selectionRange,
          //           clientRects: Array.from(rects),
          //         });
          //       }
          //     }

          //     if (folderFile && scrollRestored) {
          //       updateFileDebounced(() => {
          //         const bounds: DOMRect =
          //           wrapperRef.current?.getBoundingClientRect()!;
          //         const pageElements = document.elementsFromPoint(
          //           bounds.x + bounds.width / 2,
          //           bounds.y + bounds.height / 2
          //         );
          //         const pageNumber = pageElements
          //           .find((el) => el.hasAttribute("data-page-number"))
          //           ?.getAttribute("data-page-number");
          //         updateFile(
          //           {
          //             ...folderFile,
          //             scrollPosition: scrollTop,
          //             readPages: Number(pageNumber),
          //           },
          //           folderId
          //         );
          //       });
          //     }
          //   }}
          //   rowHeight={({ index }) =>
          //     pagesSizes[index].height * (width / pagesSizes[index].width)
          //   }
          //   rowRenderer={({ index, style }) => (
          //     <div
          //       className="relative"
          //       style={{ width: width }}
          //       key={`page_${index + 1}`}
          //     >
          //       <Page
          //         className={"!bg-transparent relative"}
          //         devicePixelRatio={Math.min(2, window.devicePixelRatio)}
          //         width={width}
          //         canvasBackground={
          //           document.documentElement.style.getPropertyValue(
          //             "--bg-color"
          //           ) || "white"
          //         }
          //         inputRef={(e) => {
          //           if (e) {
          //             e.style.setProperty("width", `${width}px`);
          //             e.style.setProperty("position", "absolute");
          //             e.style.setProperty("top", style.top + "px");
          //             e.style.setProperty("left", style.left + "px");
          //             e.id = `p${index + 1}`;
          //           }
          //         }}
          //         pageNumber={index + 1}
          //       />
          //       {folderId &&
          //         folderFile.id &&
          //         Object.values(folderFile.highlights)
          //           .filter(
          //             (h) =>
          //               h.start.pageIndex === index || h.end.pageIndex === index
          //           )
          //           .flatMap((h, i) => {
          //             const startingPageNode = document.querySelector(
          //               `#p${h.start.pageIndex} .react-pdf__Page__textContent`
          //             );
          //             const endingPageNode = document.querySelector(
          //               `#p${h.end.pageIndex} .react-pdf__Page__textContent`
          //             );

          //             const startNode = startingPageNode?.childNodes[
          //               h.start.childrenIndex
          //             ] as HTMLElement | null;
          //             const endNode = endingPageNode?.childNodes[
          //               h.end.childrenIndex
          //             ] as HTMLElement | null;
          //             if (!startNode || !endNode) return null;
          //             const range = document.createRange();
          //             try {
          //               range.setStart(startNode, h.start.offset);
          //               range.setEnd(endNode, h.end.offset);
          //             } catch (err) {
          //               return null;
          //             }
          //             const rects = range.getClientRects();
          //             return Array.from(rects).map((rect, index) => {
          //               return (
          //                 <NavLink
          //                   key={`highlight-${h.id}-${index}`}
          //                   to={`/folder/${folderId}/file/${folderFile.id}?highlight=${h.id}`}
          //                   className="absolute"
          //                   style={{
          //                     width: rect.width,
          //                     height: rect.height,
          //                     top: rect.top,
          //                     left: rect.left,
          //                     backgroundColor: "rgba(255, 0, 255, 0.327)",
          //                   }}
          //                 />
          //               );
          //             });
          //           })}
          //     </div>
          //   )}
          // />

          // )
        }
      </Document>

      {/* {folderId &&
        folderFile.id &&
        highlights.flatMap((h, index) => {
          const startNode = h.startNode;
          const endNode = h.endNode;
          const range = document.createRange();
          try {
            range.setStart(startNode, h.startOffset);
            range.setEnd(endNode, h.endOffset);
          } catch (err) {
            return null;
          }
          const hid = Object.values(folderFile.highlights)[index].id;
          const rects = range.getClientRects();
          return Array.from(rects).map((rect, index) => {
            return (
              <NavLink
                key={`highlight-${hid}-${index}`}
                to={`/folder/${folderId}/file/${folderFile.id}?highlight=${hid}`}
                className="fixed inset-0"
                style={{
                  width: rect.width,
                  height: rect.height,
                  top: rect.top,
                  left: rect.left,
                  backgroundColor: "rgba(255, 0, 255, 0.327)",
                }}
              />
            );
          });
        })} */}

      <div className="flex-shrink-0 h-[calc(100%-32px)] py-4 overflow-visible w-72">
        <Tabs
          aria-label="Options"
          classNames={{
            base: "w-full mb-2",
            tabList: "w-full bg-content2",
            cursor: "bg-content1",
            panel:
              "bg-content2 h-[calc(100%-12px)] overflow-y-auto rounded-medium",
          }}
        >
          <Tab key="outline" title="Outline">
            {doc && (
              <Outline
                className={
                  "[&__ul]:pl-6 [&__ul]:space-y-2 [&__li]:text-primary-900/60 [&__a:hover]:underline [&__a:hover]:underline-offset-2 [&__a:hover]:text-primary-900 h-full w-full"
                }
                pdf={doc}
                onItemClick={onItemClick}
              />
            )}
          </Tab>
          <Tab key="highlights" title="Highlights">
            <div className="flex flex-col gap-2 px-2">
              {Object.values(folderFile.highlights).map((highlight) => (
                <div key={highlight.id + "h"}>
                  <hgroup className="px-2 py-0.5 mx-2 flex justify-between gap-1 items-center text-xs rounded-t-lg bg-white/60">
                    <h4 className="text-primary-900">
                      Page {highlight.start.pageIndex + 1}
                    </h4>
                    <Button
                      variant="light"
                      className="h-auto min-w-0 p-2 aspect-square"
                      color="danger"
                      onPress={() =>
                        deleteHighlight(folderId, folderFile.id!, highlight.id!)
                      }
                    >
                      <Trash size={12} />
                    </Button>
                  </hgroup>
                  <Card
                    isPressable
                    onPress={() =>
                      onItemClick({ pageNumber: highlight.start.pageIndex + 1 })
                    }
                    as={Button}
                    className="items-start w-full min-w-0 py-2"
                  >
                    <p>{highlight.text}</p>
                  </Card>
                </div>
              ))}
            </div>
          </Tab>
          <Tab key="notes" title="Notes" />
        </Tabs>
      </div>
    </div>
  );
};

const MemoizedPage = memo(
  ({
    width,
    index,
    onRenderTextLayerSuccess,
  }: {
    width: number;
    index: number;
    onRenderTextLayerSuccess: () => void;
  }) => {
    return (
      <Page
        onRenderTextLayerSuccess={onRenderTextLayerSuccess}
        key={`page-${index + 1}`}
        className={"!bg-transparent relative"}
        devicePixelRatio={Math.min(2, window.devicePixelRatio)}
        width={width}
        canvasBackground={
          document.documentElement.style.getPropertyValue("--bg-color") ||
          "white"
        }
        inputRef={(e) => {
          if (e) {
            e.id = `p${index + 1}`;
          }
        }}
        pageNumber={index + 1}
      />
    );
  },
  (prevProps, nextProps) => {
    return prevProps.index === nextProps.index;
  }
);
MemoizedPage.displayName = "MemoizedPage";

export default PdfViewer;
