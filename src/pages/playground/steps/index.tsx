import { TopicPage } from "../TopicPage";
import { ScriptWritingPage } from "../ScriptWritingPage";
import { VoiceOversPage } from "../VoiceOversPage";
import { FootagePage } from "../FootagePage";
import { OverlaysPage } from "../OverlaysPage";
import { SubtitlePage } from "../SubtitlePage";
import { AudioPage } from "../AudioPage";
import { BrandKitPage } from "../BrandKitPage";
import { ExportPage } from "../ExportPage";

export function StepTopic() {
  return <TopicPage />;
}

export function StepScriptWriting() {
  return <ScriptWritingPage />;
}

export function StepVoiceOvers() {
  return <VoiceOversPage />;
}

export function StepFootage() {
  return <FootagePage />;
}

export function StepOverlays() {
  return <OverlaysPage />;
}

export function StepSubtitle() {
  return <SubtitlePage />;
}

export function StepAudio() {
  return <AudioPage />;
}

export function StepBrandKit() {
  return <BrandKitPage />;
}

export function StepExport() {
  return <ExportPage />;
}
