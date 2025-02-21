/* eslint-disable react/display-name */
import React, { useState } from "react";
import {
  Button,
  Position,
  TextDirection,
  Tooltip,
  Viewer,
  Worker,
} from "@react-pdf-viewer/core";
import {
  highlightPlugin,
  MessageIcon,
  RenderHighlightTargetProps,
} from "@react-pdf-viewer/highlight";

// Import styles
import "@react-pdf-viewer/highlight/lib/styles/index.css";
// Import the styles
import "@react-pdf-viewer/core/lib/styles/index.css";

type Props = {};
function Pdftest({}: Props) {
  const [fileArrayBuffer, setFileArrayBuffer] =
    useState<Uint8Array<ArrayBufferLike> | null>(null);
  const highlightPluginInstance = highlightPlugin({
    renderHighlightTarget: (props: RenderHighlightTargetProps) => (
      <div
        style={{
          background: "#eee",
          display: "flex",
          position: "absolute",
          left: `${props.selectionRegion.left}%`,
          top: `${props.selectionRegion.top + props.selectionRegion.height}%`,
          transform: "translate(0, 8px)",
        }}
      >
        <Tooltip
          position={Position.TopCenter}
          target={
            <Button onClick={props.toggle}>
              <MessageIcon />
            </Button>
          }
          content={() => <div style={{ width: "100px" }}>Add a note</div>}
          offset={{ left: 0, top: -8 }}
        />
      </div>
    ),
  });
  return (
    <div>
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            file.arrayBuffer().then((arrayBuffer) => {
              setFileArrayBuffer(new Uint8Array(arrayBuffer));
            });
          }
        }}
      />

      <Worker workerUrl="/pdfjs-dist-3.4.120.js">
        {fileArrayBuffer && (
          <Viewer
theme={{ direction:TextDirection.LeftToRight,theme:""}
          fileUrl={fileArrayBuffer}
            plugins={[highlightPluginInstance]}
          />
        )}
      </Worker>
    </div>
  );
}

export default Pdftest;
