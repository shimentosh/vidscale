import { StepPanel } from "../StepPanel";
import { TopicPage } from "../TopicPage";
import { ScriptWritingPage } from "../ScriptWritingPage";
import { VoiceOversPage } from "../VoiceOversPage";
import { FootagePage } from "../FootagePage";
import { BrandingPage } from "../BrandingPage";

export function StepTopic() {
  return <TopicPage />;
}

export function StepHookWriting() {
  return (
    <StepPanel
      step={2}
      title="Hook Writing"
      description="Craft an engaging hook to capture attention."
    />
  );
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
  return (
    <StepPanel
      step={6}
      title="Overlays"
      description="Add graphics, text, and overlay elements."
    />
  );
}

export function StepSubtitle() {
  return (
    <StepPanel
      step={7}
      title="Subtitle"
      description="Add and style subtitles or captions."
    />
  );
}

export function StepAudio() {
  return (
    <StepPanel
      step={8}
      title="Audio"
      description="Background music and sound design."
    />
  );
}

export function StepWatermark() {
  return <BrandingPage />;
}
