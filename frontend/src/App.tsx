import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Theme } from "@radix-ui/themes";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { NavigationEventListener } from "./events/NagivationEventListener";
import Landing from "./pages/Landing";

export default function App() {
  return (
    <ErrorBoundary>
      <Theme>
        <AuthProvider>
          <Toaster position="bottom-center" richColors />
          <BrowserRouter>
            <NavigationEventListener />
            <Routes>
              <Route path="/" element={<Landing />} />
              {/* Redirect all other routes to landing page - project is no longer deployed */}
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="/pricing" element={<Navigate to="/" replace />} />
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              <Route path="/app" element={<Navigate to="/" replace />} />
              <Route path="/auth/callback" element={<Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </Theme>
    </ErrorBoundary>
  );
}
