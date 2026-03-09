import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { applyFontSettings } from "@/lib/fontSettings";
import { SidebarProvider } from "./contexts/SidebarContext";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { MediaEditorPanel } from "./components/media-editor/MediaEditorPanel";
import { HomePage } from "./pages/HomePage";
import { BrandKitsPage } from "./pages/BrandKitsPage";
import { CreateBrandKitPage } from "./pages/CreateBrandKitPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { TemplatesPage } from "./pages/TemplatesPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { AiDesignPage } from "./pages/AiDesignPage";
import { AiEditorPage } from "./pages/AiEditorPage";
import { SettingsLayout } from "./pages/settings/SettingsLayout";
import { SettingsGeneral } from "./pages/settings/SettingsGeneral";
import { SettingsApi } from "./pages/settings/SettingsApi";
import { SettingsLocalAI } from "./pages/settings/SettingsLocalAI";
import { SettingsStorage } from "./pages/settings/SettingsStorage";
import { SettingsFonts } from "./pages/settings/SettingsFonts";
import { SettingsIntegration } from "./pages/settings/SettingsIntegration";
import { PlaygroundLayout } from "./pages/playground/PlaygroundLayout";
import {
  StepTopic,
  StepScriptWriting,
  StepVoiceOvers,
  StepFootage,
  StepOverlays,
  StepSubtitle,
  StepAudio,
  StepBrandKit,
  StepExport,
} from "./pages/playground/steps";
import { ScriptPreviewPage } from "./pages/playground/ScriptPreviewPage";
import { MediaLibraryPage } from "./pages/MediaLibraryPage";
import { XToolsPage } from "./pages/XToolsPage";

function App() {
  useEffect(() => {
    applyFontSettings();
  }, []);

  return (
    <BrowserRouter>
      <div className="flex h-full min-h-screen w-full bg-background text-foreground font-sans selection:bg-primary selection:text-black overflow-hidden">
        <SidebarProvider>
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">
          <Header />
          <main className="flex-1 min-h-0 flex flex-col overflow-auto bg-background w-full">
            <div className="flex-1 min-h-0 w-full flex flex-col">
              <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/brand-kits" element={<BrandKitsPage />} />
              <Route path="/brand-kits/new" element={<CreateBrandKitPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/templates" element={<TemplatesPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/ai-design" element={<AiDesignPage />} />
              <Route path="/ai-editor" element={<AiEditorPage />} />
              <Route path="/brand-kits/:id" element={<CreateBrandKitPage />} />
              <Route path="/editor" element={<MediaEditorPanel />} />
              <Route path="/media-library" element={<MediaLibraryPage />} />
              <Route path="/x-tools" element={<XToolsPage />} />
              <Route path="/playground" element={<PlaygroundLayout />}>
                <Route index element={<Navigate to="/playground/topic" replace />} />
                <Route path="topic" element={<StepTopic />} />
                <Route path="script-writing" element={<StepScriptWriting />} />
                <Route path="script-writing/preview" element={<ScriptPreviewPage />} />
                <Route path="voice-overs" element={<StepVoiceOvers />} />
                <Route path="media-library" element={<StepFootage />} />
                <Route path="overlays" element={<StepOverlays />} />
                <Route path="subtitle" element={<StepSubtitle />} />
                <Route path="audio" element={<StepAudio />} />
                <Route path="brand-kit" element={<StepBrandKit />} />
                <Route path="export" element={<StepExport />} />
              </Route>
              <Route path="/settings" element={<SettingsLayout />}>
                <Route index element={<SettingsGeneral />} />
                <Route path="api" element={<SettingsApi />} />
                <Route path="local-ai" element={<SettingsLocalAI />} />
                <Route path="fonts" element={<SettingsFonts />} />
                <Route path="integration" element={<SettingsIntegration />} />
                <Route path="storage" element={<SettingsStorage />} />
              </Route>
              </Routes>
            </div>
          </main>
        </div>
        </SidebarProvider>
      </div>
    </BrowserRouter>
  );
}

export default App;
