// // @ts-nocheck
// import "react-pdf/dist/Page/AnnotationLayer.css";
// import "react-pdf/dist/Page/TextLayer.css";

// import { Button } from "@heroui/button";
// import { Minus, Plus } from "lucide-react";
// import { getDocument, PDFDocumentProxy } from "pdfjs-dist";
// import { useState, useEffect, useRef } from "react";
// import { Outline } from "react-pdf";
// import { List as VList, AutoSizer, List } from "react-virtualized";

// const MaxPdfWidth = 672;

// function debounce(func: any, wait?: any, immediate?: any) {
//   let timeout: any;
//   return function () {
//     let context = this,
//       args = arguments;
//     let later = function () {
//       timeout = null;
//       if (!immediate) func.apply(context, args);
//     };
//     let callNow = immediate && !timeout;
//     clearTimeout(timeout);
//     timeout = setTimeout(later, wait);
//     if (callNow) func.apply(context, args);
//   };
// }

// function getViewportWidth() {
//   if (typeof document === "undefined") {
//     return 0; // TODO server-render default？
//   }
//   const viewportWidth = Math.max(
//     document.documentElement.clientWidth,
//     window.innerWidth || 0
//   );
//   return viewportWidth;
// }

// export default function PdfViewer({ file }: { file: File }) {
//   const listStartIndex = useRef(0);
//   const lastPageWidth = useRef(0);
//   const pageRenderingQueue = useRef([]);
//   const listScrollTop = useRef(0);

//   const [vListRef, setVListRef] = useState<List | null>(null);
//   const [numPages, setNumPages] = useState<{ width: number; height: number }[]>(
//     []
//   );
//   const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
//   const [heightDelta, setHeightDelta] = useState(0);
//   console.log(
//     pdf?.getMetadata().then((res) => {
//       console.log(res);

//       console.log(res.metadata.getAll());
//     })
//   );
//   const screenWidth = getViewportWidth();

//   const [itemWidth, setItemWidth] = useState(() =>
//     Math.min(screenWidth, MaxPdfWidth)
//   );

//   const isLargeScreen = screenWidth > MaxPdfWidth;

//   useEffect(() => {
//     const getPageInfo = async (curPdf: PDFDocumentProxy) => {
//       const page = await curPdf.getPage(1);
//       const viewport = page.getViewport({ scale: 1 });
//       const { width, height } = viewport;
//       const array: { width: number; height: number }[] = [];
//       for (let index = 0; index < curPdf.numPages; index++) {
//         array.push({ width, height });
//       }
//       setNumPages(array);
//     };

//     const fetchPdf = async () => {
//       const loadingTask = getDocument(await file.arrayBuffer());
//       const curPdf = await loadingTask.promise;
//       await setPdf(curPdf);
//       getPageInfo(curPdf);
//     };

//     fetchPdf();
//   }, []);

//   useEffect(() => {
//     recomputeListSize();
//     const newScrollTop =
//       listScrollTop.current + listStartIndex.current * heightDelta;
//     scrollToPosition(newScrollTop);
//   }, [itemWidth]);

//   const scrollToPosition = (scrollTop: number) => {
//     if (vListRef && typeof (vListRef.scrollToPosition === "function")) {
//       vListRef.scrollToPosition(scrollTop);
//     }
//   };

//   const scrollToRow = (index: number) => {
//     if (vListRef && typeof (vListRef.scrollToRow === "function")) {
//       vListRef.scrollToRow(index);
//     }
//   };

//   const getPageRatio = () => {
//     const { width: pageWidth, height: pageHeight } = numPages[0] || {};
//     if (pageHeight === undefined) {
//       return 1;
//     }
//     return pageHeight === 0 ? 1 : pageWidth / pageHeight;
//   };

//   //recompute list grid size
//   const recomputeListSize = () => {
//     if (vListRef && typeof vListRef.recomputeGridSize === "function") {
//       vListRef.recomputeGridSize();
//     }
//   };

//   const getItemHeight = (index: number, height: number) => height;

//   // const renderItem = ({
//   //   key,
//   //   index,
//   //   style,
//   //   itemWidth,
//   // }: {
//   //   key: string;
//   //   index: number;
//   //   style: React.CSSProperties;
//   //   itemWidth: number;
//   // }) => {
//   //   const space = 8;
//   //   return (
//   //     <div
//   //       key={key}
//   //       style={{
//   //         ...style,
//   //         textAlign: "center",
//   //         display: "flex",
//   //         justifyContent: "center",
//   //         paddingBottom: space,
//   //       }}
//   //     >
//   //       <canvas
//   //         style={{
//   //           width: itemWidth,
//   //           height: style.height - space,
//   //           boxShadow: "0 0 5px 2px #ccc",
//   //           backgroundColor: "#fff",
//   //         }}
//   //         data-page-number={`${index + 1}`}
//   //       />
//   //     </div>
//   //   );
//   // };

//   const renderPdf = async (pageNum: number, curPdf: PDFDocumentProxy) => {
//     const page = await curPdf.getPage(pageNum);

//     if (pageRenderingQueue.current.some((p) => p === pageNum)) {
//       return;
//     }
//     // Prepare canvas using PDF page dimensions
//     pageRenderingQueue.current = [...pageRenderingQueue.current, pageNum];
//     const canvas = document.querySelector(
//       `canvas[data-page-number='${pageNum}']`
//     );
//     const context = canvas?.getContext("2d");

//     const viewport = page.getViewport({
//       scale: isLargeScreen ? 3 : window.devicePixelRatio,
//     });
//     const { width, height } = viewport;
//     if (canvas) {
//       canvas.width = width;
//       canvas.height = height;
//     }

//     // Render PDF page into canvas context
//     const renderContext = {
//       canvasContext: context,
//       viewport: viewport,
//     };
//     const renderTask = page.render(renderContext);
//     renderTask.promise.then(() => {
//       pageRenderingQueue.current = pageRenderingQueue.current.filter(
//         (p) => p !== pageNum
//       );
//     });
//   };

//   return (
//     <div className="flex w-full h-full gap-4">
//       <div className={"pdfReader-container h-full w-full overflow-hidden"}>
//         <div className="flex justify-center h-full">
//           <AutoSizer
//             onResize={debounce(
//               ({ width, height }: { width: number; height: number }) => {
//                 setItemWidth(() => Math.min(MaxPdfWidth, width));
//                 if (
//                   (width <= MaxPdfWidth ||
//                     (lastPageWidth.current < MaxPdfWidth &&
//                       width > MaxPdfWidth)) &&
//                   pdf
//                 ) {
//                   recomputeListSize();
//                 }
//                 lastPageWidth.current = width;
//               },
//               300
//             )}
//           >
//             {({ width, height }) => {
//               if (pdf && numPages.length) {
//                 const pageRatio = getPageRatio();
//                 const rowItemWidth = itemWidth - 20;
//                 return (
//                   <VList
//                     ref={(e) => setVListRef(e)}
//                     style={{ transform: "translateX(-50%)", padding: 10 }}
//                     overscanRowCount={3}
//                     rowCount={numPages.length}
//                     onScroll={({ scrollTop }) =>
//                       (listScrollTop.current = scrollTop)
//                     }
//                     width={width}
//                     height={height}
//                     rowHeight={({ index }) =>
//                       getItemHeight(index, rowItemWidth / pageRatio)
//                     }
//                     rowRenderer={({ key, index, style }) =>
//                       renderItem({ key, index, style, itemWidth: rowItemWidth })
//                     }
//                     onRowsRendered={({
//                       overscanStartIndex,
//                       overscanStopIndex,
//                       startIndex,
//                       stopIndex,
//                     }) => {
//                       if (startIndex === 0) {
//                         renderPdf(1, pdf);
//                         renderPdf(2, pdf);
//                       } else {
//                         const pageNum =
//                           listStartIndex.current <= startIndex
//                             ? stopIndex + 1
//                             : startIndex + 1;
//                         renderPdf(pageNum, pdf);
//                       }
//                       listStartIndex.current = startIndex;
//                     }}
//                   />
//                 );
//               } else {
//                 return null;
//               }
//             }}
//           </AutoSizer>
//         </div>
//         {isLargeScreen ? (
//           <div className="pdfReader-scale-button-cot">
//             <Button
//               onPress={() => {
//                 const nextWidth = 1.1 * itemWidth;
//                 const pageRatio = getPageRatio();
//                 setItemWidth(nextWidth);
//                 setHeightDelta((0.1 * itemWidth) / pageRatio);
//               }}
//             >
//               <Plus />
//             </Button>
//             <Button
//               onPress={() => {
//                 const nextWidth = 0.9 * itemWidth;
//                 const pageRatio = getPageRatio();
//                 setItemWidth(nextWidth);
//                 setHeightDelta((-0.1 * itemWidth) / pageRatio);
//               }}
//             >
//               <Minus />
//             </Button>
//           </div>
//         ) : null}
//       </div>
//       <div className="grid grid-rows-[1fr_48px] h-full py-2">
//         {pdf && (
//           <Outline
//             className={
//               "[&__ul]:pl-6 h-full w-72 flex-shrink-0 overflow-x-hidden"
//             }
//             pdf={pdf}
//             onItemClick={({ pageNumber }) => {
//               scrollToRow(pageNumber - 1);
//             }}
//           />
//         )}
//       </div>
//     </div>
//   );
// }

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useEffect, useRef, useState } from "react";
import { Document, Outline, Page } from "react-pdf";
import { PDFDocumentProxy } from "pdfjs-dist";

// import { VList } from "virtua";
// type Props = {};

const PdfViewer = ({ file }: { file: File }) => {
  const [doc, setDoc] = useState<PDFDocumentProxy | null>();
  const numPages = doc?.numPages;
  // const [highlightedText, setHighlightedText] = useState<Selection | null>();
  const [width, setWidth] = useState<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  function onItemClick({ pageNumber }: { pageNumber: number }) {
    document
      .querySelector?.(`[data-page-number="${pageNumber}"]`)
      ?.scrollIntoView({
        block: "center",
        inline: "center",
        behavior: "instant",
      });
  }

  useEffect(() => {
    // Put a resize observer on the wrapper to get the width of the document
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        setWidth(width);
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
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div className="flex h-full gap-8 overflow-hidden">
      <Document
        inputRef={wrapperRef}
        className={"h-full overflow-y-auto overflow-x-hidden flex-grow"}
        file={file}
        onLoadSuccess={(d) => {
          console.log(
            d.getMetadata().then((m) => console.log(m.metadata.getAll()))
          );
          setDoc(d);
        }}
        onMouseUp={() => {
          const selectedText = window.getSelection();
          // const start = selectedText?.anchorOffset;
          // const end = selectedText?.focusOffset;

          if (selectedText) {
            // setHighlightedText(selectedText);
            console.log(selectedText);
          }
        }}
      >
        {numPages &&
          width &&
          Array.from(new Array(numPages), (_, index) => (
            <Page
              className={"!bg-transparent"}
              devicePixelRatio={Math.min(2, window.devicePixelRatio)}
              width={width}
              key={`page_${index + 1}`}
              // canvasBackground="var(--bg-color)"
              pageNumber={index + 1}
            />
          ))}
      </Document>
      {doc && (
        <Outline
          className={"[&__ul]:pl-6 h-full w-72 flex-shrink-0 overflow-x-hidden"}
          pdf={doc}
          onItemClick={onItemClick}
        />
      )}
    </div>
  );
};

export default PdfViewer;
