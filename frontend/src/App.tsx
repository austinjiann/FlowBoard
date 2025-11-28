import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Theme } from "@radix-ui/themes";
import { Toaster } from "sonner";
import Landing from "./pages/Landing";
import Canvas from "./pages/Canvas";
import Pricing from "./pages/Pricing";

export default function App() {
  return (
    <Theme>
      <Toaster position="bottom-center" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/app" element={<Canvas />} />
        </Routes>
      </BrowserRouter>
    </Theme>
  );
}
