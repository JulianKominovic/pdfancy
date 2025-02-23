/* eslint-disable react/display-name */
import React, { useState } from "react";
import {
  Position,
  TextDirection,
  Tooltip,
  Viewer,
  Worker,
  PageLayout,
} from "@react-pdf-viewer/core";
import {
  highlightPlugin,
  MessageIcon,
  RenderHighlightContentProps,
  RenderHighlightTargetProps,
} from "@react-pdf-viewer/highlight";

// Import styles
import "@react-pdf-viewer/highlight/lib/styles/index.css";
// Import the styles
import "@react-pdf-viewer/core/lib/styles/index.css";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { ButtonGroup, Button } from "@heroui/button";
import { Copy } from "lucide-react";
import { CategoryFile } from "@/stores/categories";

function PdfViewer({
  file,
  categoryFile,
  categoryId,
}: {
  file: File;
  categoryFile: CategoryFile;
  categoryId: string;
}) {
  const highlightPluginInstance = highlightPlugin({
    renderHighlightContent: (props: RenderHighlightContentProps) => {
      const addNote = () => {
        // We will implement it later
      };

      return (
        <form
          style={{
            background: "#fff",
            border: "1px solid rgba(0, 0, 0, .3)",
            borderRadius: "2px",
            padding: "8px",
            position: "absolute",
            left: `${props.selectionRegion.left}%`,
            top: `${props.selectionRegion.top + props.selectionRegion.height}%`,
            zIndex: 1,
          }}
        >
          <div>
            <textarea
              rows={3}
              style={{
                border: "1px solid rgba(0, 0, 0, .3)",
              }}
              // onChange={(e) => setMessage(e.target.value)}
            ></textarea>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: "8px",
            }}
          >
            <div style={{ marginRight: "8px" }}>
              <Button onPress={addNote}>Add</Button>
            </div>
            <Button onPress={props.cancel}>Cancel</Button>
          </div>
        </form>
      );
    },
    renderHighlightTarget: (props: RenderHighlightTargetProps) => (
      <div
        style={{
          background: "transparent",
          position: "absolute",
          left: `${props.selectionRegion.left}%`,
          top: `${props.selectionRegion.top + props.selectionRegion.height}%`,
          transform: "translate(0, 8px)",
          zIndex: 10,
        }}
      >
        <ButtonGroup color="primary" className="bg-content2">
          <Button
            // onPress={() => {
            //   const { start, end } = selectionRange;
            //   if (
            //     start.pageIndex >= 0 &&
            //     end.pageIndex >= 0 &&
            //     start.childrenIndex !== -1 &&
            //     end.childrenIndex !== -1
            //   ) {
            //     // Find the closes element data-page-number
            //     addOrSetHighlight(folderId, folderFile.id!, {
            //       color: "#333",
            //       start: {
            //         offset: selectionRange.start.offset,
            //         pageIndex: start.pageIndex,
            //         childrenIndex: start.childrenIndex,
            //       },
            //       end: {
            //         offset: selectionRange.end.offset,
            //         pageIndex: end.pageIndex,
            //         childrenIndex: end.childrenIndex,
            //       },
            //       reflections: [],
            //       text: window.getSelection()?.toString() || "",
            //     });
            //   }
            // }}
            className="min-w-0 text-primary-800 bg-primary-300"
          >
            Add to highlights
          </Button>
          <Button className="min-w-0 text-primary-800 bg-primary-300">
            <Copy size={14} />
          </Button>
        </ButtonGroup>
      </div>
    ),
  });
  return (
    <Worker workerUrl="/pdfjs-dist-3.4.120.js">
      <Viewer
        theme={{ direction: TextDirection.LeftToRight, theme: "" }}
        fileUrl={file as any}
        plugins={[highlightPluginInstance]}
      />
    </Worker>
  );
}

export default PdfViewer;
