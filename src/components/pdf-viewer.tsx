import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useEffect, useRef, useState } from "react";
import { Document, Outline, Page } from "react-pdf";
import { PDFDocumentProxy } from "pdfjs-dist";
import { Skeleton } from "@heroui/skeleton";
import { Tabs, Tab } from "@heroui/tabs";
import { Button } from "@heroui/button";
import { Trash } from "lucide-react";
import { Card } from "@heroui/card";
import { List as VList } from "react-virtualized";
import { Virtuoso } from "react-virtuoso";
import PdfHighlights from "./pdf-highlights";

import { FolderFile, useFoldersStore } from "@/stores/folders";
import { useDebounceFunction } from "@/hooks/use-debounce-fn";
import { Textarea } from "@heroui/input";

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
  const [scrollRestored, setScrollRestored] = useState(false);
  const [scale, _setScale] = useState(1);
  const updateFile = useFoldersStore((s) => s.updateFile);
  const [doc, setDoc] = useState<PDFDocumentProxy | null>();
  const readerRef = useRef<HTMLDivElement>(null);
  const numPages = doc?.numPages;

  const [width, setWidth] = useState<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const vlistRef = useRef<VList | null>(null);
  const { debounce } = useDebounceFunction(100);
  const { debounce: updateFileDebounced } = useDebounceFunction(300);
  const deleteHighlight = useFoldersStore((s) => s.deleteHighlight);

  function onItemClick({ pageNumber }: { pageNumber: number }) {
    if (vlistRef.current) {
      vlistRef.current?.scrollToRow(pageNumber - 1);
    }
    document.querySelector(`#p${pageNumber}`)?.scrollIntoView({
      behavior: "instant",
      block: "center",
    });
  }

  useEffect(() => {
    // Put a resize observer on the wrapper to get the width of the document
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        debounce(() => {
          pagesLoaded.current = 0;
          setWidth(width);
          if (vlistRef.current) {
            vlistRef.current?.recomputeRowHeights();
          }
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
        {width && numPages && pagesSizes.length === numPages && (
          <Virtuoso
            // itemsRendered={(index) => {
            //   console.log("[VIRTUOSO]", "Items rendered", index);
            // }}
            data={pagesSizes}
            overscan={3 * pagesSizes[0].height * (width / pagesSizes[0].width)}
            defaultItemHeight={
              pagesSizes[0].height * (width / pagesSizes[0].width)
            }
            // components={{
            //   // eslint-disable-next-line react/display-name
            //   List: ({ children, ...rest }) => (
            //     <div {...rest} className="relative">
            //       <PdfHighlights
            //         folderId={folderId}
            //         folderFile={folderFile}
            //         readerRef={readerRef}
            //         pagesLoaded={
            //           numPages !== undefined && pagesSizes.length >= numPages
            //         }
            //       />
            //       {children}
            //     </div>
            //   ),
            // }}
            itemContent={(index, pageSize) => (
              <PdfPage
                pageNumber={index + 1}
                width={width}
                height={pageSize.height}
                index={index}
                folderFile={folderFile}
              />
            )}
          />
        )}
        {/* {width && numPages && pagesSizes.length === numPages && (
          // @ts-ignore
          <VList
            ref={vlistRef}
            scrollTop={
              scrollRestored ? undefined : folderFile?.scrollPosition || 0
            }
            width={width}
            height={wrapperRef.current?.clientHeight || 0}
            rowCount={numPages}
            onRowsRendered={() => {
              if (scrollRestored) return;
              setScrollRestored(true);
            }}
            onScroll={({ scrollTop }) => {
              if (folderFile && scrollRestored) {
                updateFileDebounced(() => {
                  const bounds: DOMRect =
                    wrapperRef.current?.getBoundingClientRect()!;
                  const pageElements = document.elementsFromPoint(
                    bounds.x + bounds.width / 2,
                    bounds.y + bounds.height / 2
                  );
                  const pageNumber = pageElements
                    .find((el) => el.hasAttribute("data-page-number"))
                    ?.getAttribute("data-page-number");
                  updateFile(
                    {
                      ...folderFile,
                      scrollPosition: scrollTop,
                      readPages: Number(pageNumber),
                    },
                    folderId
                  );
                });
              }
            }}
            rowHeight={({ index }) =>
              pagesSizes[index].height * (width / pagesSizes[index].width)
            }
            estimatedRowSize={
              pagesSizes[0].height * (width / pagesSizes[0].width)
            }
            rowRenderer={({ index, style }) => (
              <div style={style} key={`page_${index + 1}`}>
                <Page
                  className={"!bg-transparent"}
                  devicePixelRatio={Math.min(2, window.devicePixelRatio)}
                  width={width}
                  canvasBackground={
                    document.documentElement.style.getPropertyValue(
                      "--bg-color"
                    ) || "white"
                  }
                  pageNumber={index + 1}
                />
              </div>
            )}
          />
        )} */}
      </Document>

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
                    <blockquote className="text-sm text-left whitespace-normal">
                      {highlight.text}
                    </blockquote>
                  </Card>
                  <form className="px-2 pt-2 pb-2 mx-2 text-xs rounded-b-lg bg-white/60 h-fit">
                    <Textarea
                      rows={1}
                      classNames={{
                        inputWrapper:
                          "bg-transparent shadow-none min-h-0 data-[hover]:bg-content2 data-[focus]:bg-content2 group-data-[focus]:bg-content2",
                      }}
                      minRows={1}
                      className="max-w-xs mb-1 border-none mx-uto"
                      placeholder="Start typing..."
                      variant="flat"
                    />
                    <Button
                      variant="shadow"
                      className="text-black bg-content2"
                      color="primary"
                    >
                      Save
                    </Button>
                  </form>
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

function PdfPage({
  pageNumber,
  width,
  height,
  index,
  folderFile,
}: {
  pageNumber: number;
  width: number;
  height: number;
  index: number;
  folderFile: FolderFile;
}) {
  const [textLayerRendered, setTextLayerRendered] = useState(false);
  return (
    <div className="relative" key={`page_${index + 1}`}>
      <Page
        onRenderTextLayerSuccess={() => setTextLayerRendered(true)}
        className={"!bg-transparent"}
        devicePixelRatio={Math.min(2, window.devicePixelRatio)}
        width={width}
        canvasBackground={
          document.documentElement.style.getPropertyValue("--bg-color") ||
          "white"
        }
        pageNumber={index + 1}
      />
      {textLayerRendered &&
        Object.values(folderFile.highlights)
          .filter((r) => {
            const { start, end } = r;
            return start.pageIndex === index || end.pageIndex === index;
          })
          .flatMap((highlight) => {
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
                        .getBoundingClientRect().x,
                    backgroundColor: "rgba(255, 0, 255, 0.327)",
                  }}
                />
              );
            });
          })}
    </div>
  );
}

export default PdfViewer;
