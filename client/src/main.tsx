import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <DndProvider backend={HTML5Backend}>
      <App />
    </DndProvider>
  </QueryClientProvider>
);
