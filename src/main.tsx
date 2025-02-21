import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
// import { pdfjs } from "react-pdf";
// import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?worker";
// pdfjs.GlobalWorkerOptions.workerPort = new pdfWorker();

import App from "./routes.tsx";
import { Provider } from "./provider.tsx";
import "@/styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Provider>
      <App />
    </Provider>
  </BrowserRouter>
);
