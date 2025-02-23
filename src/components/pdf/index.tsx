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
  RenderHighlightContentProps,
  RenderHighlightTargetProps,
} from "@react-pdf-viewer/highlight";

// Import styles
import "@react-pdf-viewer/highlight/lib/styles/index.css";
// Import the styles
import "@react-pdf-viewer/core/lib/styles/index.css";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { ButtonGroup, Button } from "@heroui/button";
import {
  Copy,
  HighlighterIcon,
  MessageSquareMoreIcon,
  SaveIcon,
  Trash,
} from "lucide-react";
import { FolderFile, useFoldersStore } from "@/stores/folders";
import { Tab, Tabs } from "@heroui/tabs";
import { Textarea } from "@heroui/input";

function PdfViewer({
  file,
  folderFile,
  folderId,
}: {
  file: Uint8Array<ArrayBufferLike>;
  folderFile: FolderFile;
  folderId: string;
}) {
  const addOrSetHighlight = useFoldersStore((state) => state.addOrSetHighlight);
  const deleteHighlight = useFoldersStore((state) => state.deleteHighlight);
  const highlightPluginInstance = highlightPlugin({
    renderHighlights(props) {
      return (
        <div>
          {Object.values(folderFile.highlights).map((highlight) => (
            <React.Fragment key={highlight.id}>
              {highlight.tracking
                .filter((area) => area.pageIndex === props.pageIndex)
                .map((area, idx) => (
                  <Button
                    key={idx}
                    variant="light"
                    color="primary"
                    className="z-10 min-w-0 cursor-pointer"
                    style={{
                      ...props.getCssProperties(area, props.rotation),
                      background: "yellow",
                      opacity: 0.4,
                    }}
                  />
                ))}
            </React.Fragment>
          ))}
        </div>
      );
    },
    renderHighlightTarget: (props: RenderHighlightTargetProps) => {
      const wrapper = document.querySelector('[data-testid="core__viewer"]');
      const wrapperWidth = wrapper!.clientWidth!;
      const leftInPixels = (props.selectionRegion.left / 100) * wrapperWidth;
      const maxWidth = 300;
      const maxHeight = 96;
      const transformY = 24;
      const leftIsOverflowing = leftInPixels > wrapperWidth - maxWidth;
      const safeLeft = leftIsOverflowing
        ? ((wrapperWidth - maxWidth) / wrapperWidth) * 100
        : props.selectionRegion.left;
      const wrapperHeight = wrapper!.clientHeight!;
      const topInPixels = (props.selectionRegion.top / 100) * wrapperHeight;
      const topIsOverflowing =
        topInPixels > wrapperHeight - maxHeight - transformY;
      const safeTop = topIsOverflowing
        ? ((wrapperHeight - maxHeight - transformY * 2) / wrapperHeight) * 100
        : props.selectionRegion.top;

      return (
        <div
          style={{
            background: "transparent",
            position: "absolute",
            //   Prevent popup from overflowing container data-testid="core__viewer"
            left: `${safeLeft}%`,
            top: `${safeTop}%`,
            transform: `translate(0, ${transformY}px)`,
            zIndex: 10,
            width: "auto",
            maxWidth,
            maxHeight,
          }}
        >
          <ButtonGroup
            color="primary"
            variant="shadow"
            className="text-black bg-content2 rounded-medium shadow-medium"
          >
            <Button
              className="text-primary-800"
              onPress={() => {
                addOrSetHighlight(folderId, folderFile.id!, {
                  color: "red",
                  reflections: [],
                  text: props.selectedText,
                  tracking: props.highlightAreas,
                });
                props.cancel();
              }}
            >
              <HighlighterIcon size={16} /> Highlight
            </Button>
            <Button className="text-primary-800">
              <MessageSquareMoreIcon size={16} /> Comment
            </Button>
          </ButtonGroup>
        </div>
      );
    },
  });
  const { jumpToHighlightArea } = highlightPluginInstance;
  return (
    <Worker workerUrl="/pdfjs-dist-3.4.120.js">
      <div className="relative flex justify-between h-full gap-8 overflow-hidden">
        <Viewer
          theme={{
            direction: TextDirection.LeftToRight,
            theme: "light",
          }}
          fileUrl={file}
          plugins={[highlightPluginInstance]}
        />
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
              {/* {doc && (
            <Outline
              className={
                "[&__ul]:pl-6 [&__ul]:space-y-2 [&__li]:text-primary-900/60 [&__a:hover]:underline [&__a:hover]:underline-offset-2 [&__a:hover]:text-primary-900 h-full w-full"
              }
              pdf={doc}
              onItemClick={onItemClick}
            />
          )} */}
              a
            </Tab>
            <Tab key="highlights" title="Highlights">
              <div className="flex flex-col gap-2 px-2">
                {Object.values(folderFile.highlights).map((highlight) => (
                  <div key={highlight.id + "h"}>
                    <hgroup className="px-2 py-0.5 mx-2 flex justify-between gap-1 items-center text-xs rounded-t-lg bg-white/60">
                      <h4 className="text-primary-900">
                        Page {highlight.tracking[0].pageIndex + 1}
                      </h4>
                      <Button
                        variant="light"
                        className="h-auto min-w-0 p-2 aspect-square"
                        color="danger"
                        onPress={() => {
                          deleteHighlight(
                            folderId,
                            folderFile.id!,
                            highlight.id!
                          );
                        }}
                      >
                        <Trash size={12} />
                      </Button>
                    </hgroup>
                    <Card
                      isPressable
                      onPress={() => {
                        jumpToHighlightArea(highlight.tracking[0]);
                      }}
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
            <Tab key="notes" title="Notes">
              <div>
                <h1>Notes</h1>
              </div>
            </Tab>
          </Tabs>
        </div>
      </div>
    </Worker>
  );
}

export default PdfViewer;
