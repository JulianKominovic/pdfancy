import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

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
