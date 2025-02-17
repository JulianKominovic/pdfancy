import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import DefaultLayout from "./layouts/default";
import Category from "./pages/category";
import PdfPage from "./pages/pdf";

function App() {
  return (
    <DefaultLayout>
      <Routes>
        <Route element={<IndexPage />} path="/" />
        <Route element={<Category />} path="/category/:id?" />
        <Route element={<PdfPage />} path="/read/:fileName?" />
      </Routes>
    </DefaultLayout>
  );
}

export default App;
