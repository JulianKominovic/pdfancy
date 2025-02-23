/*
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useEffect, useRef, useState } from "react";
import { Document, Outline, Page } from "react-pdf";
import { PDFDocumentProxy } from "pdfjs-dist";
import { Skeleton } from "@heroui/skeleton";
import { List as VList } from "react-virtualized";

import { useDebounceFunction } from "@/hooks/use-debounce-fn";
import loggers from "@/utils/loggers";
import { CategoryFile, useCategoriesStore } from "@/stores/categories";

const PdfViewer = ({
  file,
  categoryFile,
  categoryId,
}: {
  file: File;
  categoryFile: CategoryFile;
  categoryId: string;
}) => {
  const [pagesSizes, setPagesSizes] = useState<
    {
      width: number;
      height: number;
    }[]
  >([]);
  const [scrollRestored, setScrollRestored] = useState(false);
  const [scale, _setScale] = useState(1);
  const updateFile = useCategoriesStore((s) => s.updateFile);
  const [doc, setDoc] = useState<PDFDocumentProxy | null>();
  const numPages = doc?.numPages;
  // const [highlightedText, setHighlightedText] = useState<Selection | null>();
  const [width, setWidth] = useState<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const vlistRef = useRef<VList | null>(null);
  const { debounce } = useDebounceFunction(100);
  const { debounce: updateFileDebounced } = useDebounceFunction(300);

  function onItemClick({ pageNumber }: { pageNumber: number }) {
    if (vlistRef.current) {
      vlistRef.current?.scrollToRow(pageNumber - 1);
    }
  }

  useEffect(() => {
    // Put a resize observer on the wrapper to get the width of the document
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        debounce(() => {
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
    <div className="relative flex justify-between h-full gap-8 overflow-hidden">
      <Document
        inputRef={wrapperRef}
        className={
          "h-full overflow-y-auto mx-auto overflow-x-hidden flex-grow max-w-screen-md"
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
        onMouseUp={() => {
          const selectedText = window.getSelection();
          // const start = selectedText?.anchorOffset;
          // const end = selectedText?.focusOffset;

          if (selectedText) {
            // setHighlightedText(selectedText);
            loggers.layers.component("selectedText", selectedText);
          }
        }}
      >
        {numPages && width && pagesSizes.length === numPages && (
          // @ts-ignore
          <VList
            ref={vlistRef}
            scrollTop={
              scrollRestored ? undefined : categoryFile?.scrollPosition || 0
            }
            width={width}
            height={wrapperRef.current?.clientHeight || 0}
            rowCount={numPages}
            onRowsRendered={() => {
              if (scrollRestored) return;
              setScrollRestored(true);
            }}
            onScroll={({ scrollTop }) => {
              if (categoryFile && scrollRestored) {
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
                      ...categoryFile,
                      scrollPosition: scrollTop,
                      readPages: Number(pageNumber),
                    },
                    categoryId
                  );
                });
              }
            }}
            rowHeight={({ index }) =>
              pagesSizes[index].height * (width / pagesSizes[index].width)
            }
            rowRenderer={({ index, style }) => (
              <Page
                className={"!bg-transparent"}
                devicePixelRatio={Math.min(2, window.devicePixelRatio)}
                width={width}
                key={`page_${index + 1}`}
                canvasBackground={
                  document.documentElement.style.getPropertyValue(
                    "--bg-color"
                  ) || "white"
                }
                inputRef={(e) => {
                  if (e) {
                    e.style.setProperty("width", `${width}px`);
                    e.style.setProperty("position", "absolute");
                    e.style.setProperty("top", style.top + "px");
                    e.style.setProperty("left", style.left + "px");
                  }
                }}
                pageNumber={index + 1}
              />
            )}
          />
        )}
      </Document>
      <div className="flex-shrink-0 h-[calc(100%-32px)] py-8 overflow-x-hidden w-72">
        {doc && (
          <Outline
            className={
              "[&__ul]:pl-6 [&__ul]:space-y-2 [&__li]:text-primary-900/60 [&__a:hover]:underline [&__a:hover]:underline-offset-2 [&__a:hover]:text-primary-900 h-full w-full"
            }
            pdf={doc}
            onItemClick={onItemClick}
          />
        )}
      </div>
    </div>
  );
};

export default PdfViewer;


*/
