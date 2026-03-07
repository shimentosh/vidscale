import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { MediaEditorPanel } from "./components/media-editor/MediaEditorPanel";
import { BrandKitsPage } from "./pages/BrandKitsPage";
import { CreateBrandKitPage } from "./pages/CreateBrandKitPage";
import { SettingsLayout } from "./pages/settings/SettingsLayout";
import { SettingsGeneral } from "./pages/settings/SettingsGeneral";
import { SettingsApi } from "./pages/settings/SettingsApi";
import { SettingsStorage } from "./pages/settings/SettingsStorage";
import { PlaygroundLayout } from "./pages/playground/PlaygroundLayout";
import {
  StepTopic,
  StepScriptWriting,
  StepVoiceOvers,
  StepFootage,
  StepOverlays,
  StepSubtitle,
  StepAudio,
  StepWatermark,
} from "./pages/playground/steps";
import { ScriptPreviewPage } from "./pages/playground/ScriptPreviewPage";
import { MediaLibraryPage } from "./pages/MediaLibraryPage";
import { XToolsPage } from "./pages/XToolsPage";

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen w-full bg-background text-foreground font-sans selection:bg-primary selection:text-black overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <Header />
          <main className="flex-1 overflow-auto bg-[#0A0D14]">
            <Routes>
              <Route path="/" element={<BrandKitsPage />} />
              <Route path="/brand-kits/new" element={<CreateBrandKitPage />} />
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
                <Route path="branding" element={<StepWatermark />} />
              </Route>
              <Route path="/settings" element={<SettingsLayout />}>
                <Route index element={<SettingsGeneral />} />
                <Route path="api" element={<SettingsApi />} />
                <Route path="storage" element={<SettingsStorage />} />
              </Route>
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
