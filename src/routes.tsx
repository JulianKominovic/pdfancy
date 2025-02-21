import { Route, Routes, Navigate } from "react-router-dom";

import DefaultLayout from "./layouts/default";
import Folder from "./pages/folder";
import PdfPage from "./pages/pdf";

import IndexPage from "@/pages/index";

function App() {
  return (
    <DefaultLayout>
      <Routes>
        <Route element={<IndexPage />} path="/" />
        <Route element={<Folder />} path="/folder/:folderId?" />
        <Route element={<PdfPage />} path="/folder/:folderId/:fileId" />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </DefaultLayout>
  );
}

export default App;
