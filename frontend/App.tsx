import { useState, useEffect, useCallback } from "react";
import "./index.css";
import "./styles/animations.css";
import { ThemeProvider } from "./lib/theme";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";
import Pricing from "./components/Pricing";
import AIChat from "./components/AIChat";
import DocumentUpload from "./components/DocumentUpload";
import KnowledgeGraph from "./components/KnowledgeGraph";
import Flashcards from "./components/Flashcards";
import Presentations from "./components/Presentations";
import DeepFocus from "./components/DeepFocus";
import Sidebar from "./components/Sidebar";
import CommandPalette from "./components/CommandPalette";

// 10 Pillars
import GamePage from "./components/pillars/GamePage";
import ProduktivitasPage from "./components/pillars/ProduktivitasPage";
import EdukasiPage from "./components/pillars/EdukasiPage";
import PemasaranPage from "./components/pillars/PemasaranPage";
import OperasionalPage from "./components/pillars/OperasionalPage";
import HobiPage from "./components/pillars/HobiPage";
import KehidupanPage from "./components/pillars/KehidupanPage";
import AksesPage from "./components/pillars/AksesPage";
import KesejahteraanPage from "./components/pillars/KesejahteraanPage";
import KeberlanjutanPage from "./components/pillars/KeberlanjutanPage";

export type Route =
  | "landing"
  | "dashboard"
  | "chat"
  | "documents"
  | "knowledge"
  | "flashcards"
  | "presentations"
  | "focus"
  | "pricing"
  | "game"
  | "produktivitas"
  | "edukasi"
  | "pemasaran"
  | "operasional"
  | "hobi"
  | "kehidupan"
  | "akses"
  | "kesejahteraan"
  | "keberlanjutan";

function getUserId(): string {
  let id = localStorage.getItem("neurova_user_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("neurova_user_id", id);
  }
  return id;
}

function getRouteFromHash(): Route {
  const hash = window.location.hash.replace("#/", "").split("?")[0];
  const validRoutes: Route[] = [
    "landing", "dashboard", "chat", "documents",
    "knowledge", "flashcards", "presentations", "focus", "pricing",
    "game", "produktivitas", "edukasi", "pemasaran", "operasional",
    "hobi", "kehidupan", "akses", "kesejahteraan", "keberlanjutan"
  ];
  return (validRoutes.includes(hash as Route) ? hash : "landing") as Route;
}

function AppContent() {
  const [route, setRoute] = useState<Route>(getRouteFromHash);
  const [userId] = useState<string>(getUserId);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>("");
  const [focusMode, setFocusMode] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(getRouteFromHash());
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // CMD+K / CTRL+K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setCmdOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const navigate = useCallback((r: Route) => {
    window.location.hash = `/${r}`;
    setRoute(r);
  }, []);

  // Theme logic is now handled in ThemeProvider
  useEffect(() => {
    // No-op, maintained for compatibility if needed elsewhere
  }, []);

  if (focusMode) {
    return (
      <div className="bg-bp-white text-bp-deep-black min-h-screen">
        <DeepFocus onExit={() => setFocusMode(false)} />
        {cmdOpen && <CommandPalette onNavigate={navigate} onClose={() => setCmdOpen(false)} />}
      </div>
    );
  }

  if (route === "landing") {
    return (
      <div className="bg-bp-white text-bp-deep-black min-h-screen">
        <LandingPage onNavigate={navigate} />
        {cmdOpen && <CommandPalette onNavigate={navigate} onClose={() => setCmdOpen(false)} />}
      </div>
    );
  }

  return (
    <div className="bg-bp-white text-bp-deep-black min-h-screen flex">
      <Sidebar currentRoute={route} onNavigate={navigate} onCmdK={() => setCmdOpen(true)} />
      <main style={{ flex: 1, marginLeft: "260px", minHeight: "100vh", overflowY: "auto", background: "var(--bp-surface-white)" }}>
        {route === "dashboard" && (
          <Dashboard
            userId={userId}
            onNavigate={navigate}
            onSelectDocument={setSelectedDocumentId}
            onFocusMode={() => setFocusMode(true)}
          />
        )}
        {route === "chat" && <AIChat userId={userId} documentId={selectedDocumentId} />}
        {route === "documents" && (
          <DocumentUpload
            userId={userId}
            onDocumentProcessed={(id) => {
              setSelectedDocumentId(id);
            }}
          />
        )}
        {route === "knowledge" && (
          <KnowledgeGraph documentId={selectedDocumentId} userId={userId} />
        )}
        {route === "flashcards" && (
          <Flashcards documentId={selectedDocumentId} userId={userId} />
        )}
        {route === "presentations" && (
          <Presentations documentId={selectedDocumentId} userId={userId} />
        )}
        {route === "pricing" && <Pricing userId={userId} onNavigate={navigate} />}
        {route === "focus" && <DeepFocus onExit={() => navigate("dashboard")} />}
        
        {/* 10 Pillars Routes */}
        {route === "game" && <GamePage />}
        {route === "produktivitas" && <ProduktivitasPage />}
        {route === "edukasi" && <EdukasiPage />}
        {route === "pemasaran" && <PemasaranPage />}
        {route === "operasional" && <OperasionalPage />}
        {route === "hobi" && <HobiPage />}
        {route === "kehidupan" && <KehidupanPage />}
        {route === "akses" && <AksesPage />}
        {route === "kesejahteraan" && <KesejahteraanPage />}
        {route === "keberlanjutan" && <KeberlanjutanPage />}
      </main>
      {cmdOpen && <CommandPalette onNavigate={navigate} onClose={() => setCmdOpen(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
