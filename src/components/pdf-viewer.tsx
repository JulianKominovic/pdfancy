import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import React, { useEffect, useRef, useState } from "react";
import { Document, Outline, Page } from "react-pdf";
import { PDFDocumentProxy } from "pdfjs-dist";

import { VList } from "virtua";
type Props = {};

const PdfViewer = ({ file }: { file: File }) => {
  const [doc, setDoc] = useState<PDFDocumentProxy | null>();
  const numPages = doc?.numPages;
  const [highlightedText, setHighlightedText] = useState<Selection | null>();
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
    <div className="flex gap-8 overflow-hidden h-full">
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
          const start = selectedText?.anchorOffset;
          const end = selectedText?.focusOffset;

          if (selectedText) {
            // setHighlightedText(selectedText);
            console.log(selectedText);
          }
        }}
      >
        <VList style={{ height: "100%" }}>
          {width !== null &&
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
        </VList>
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
