import { Route, Routes, Navigate } from "react-router-dom";

import DefaultLayout from "./layouts/default";
import Category from "./pages/category";
import PdfPage from "./pages/pdf";

import IndexPage from "@/pages/index";

function App() {
  return (
    <DefaultLayout>
      <Routes>
        <Route element={<IndexPage />} path="/" />
        <Route element={<Category />} path="/category/:categoryId?" />
        <Route element={<PdfPage />} path="/category/:categoryId/:fileId" />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </DefaultLayout>
  );
}

export default App;
