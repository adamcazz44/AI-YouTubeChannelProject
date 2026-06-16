import React from "react";
import {Composition} from "remotion";
import {TestComp} from "./TestComp";
import {FPS, MotivationVideo, MotivationVideoProps} from "./MotivationVideo";

// Defaults exist only so Remotion Studio can instantiate the composition for preview.
// scripts/render-video.js overrides these with real phrases/clips at render time.
const motivationDefaults: MotivationVideoProps = {
  theme: "grinding in obscurity",
  phrases: [
    {
      text: "Nobody is coming. Build it yourself.",
      style: "short",
      emotion: "defiant",
      screen_duration_seconds: 4,
    },
    {
      text: "The internet does not care where you started, only where you are going.",
      style: "medium",
      emotion: "determined",
      screen_duration_seconds: 5,
    },
    {
      text: "Every late night you keep showing up when no one is watching is a brick in something only you can see yet.",
      style: "long",
      emotion: "cinematic",
      screen_duration_seconds: 7,
    },
  ],
  clips: [
    {id: "placeholder", file: "footage/placeholder.mp4", duration: 10, width: 1920, height: 1080},
  ],
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Spec 1 verification artifact — do not remove. */}
      <Composition
        id="TestComp"
        component={TestComp}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Spec 4 — the production renderer. Vertical 1080x1920 for YouTube Shorts
          (<=60s). Duration is derived from the phrases. */}
      <Composition
        id="MotivationVideo"
        component={MotivationVideo}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={motivationDefaults}
        calculateMetadata={({props}) => {
          const frames = props.phrases.reduce(
            (sum, p) => sum + Math.max(1, Math.round(p.screen_duration_seconds * FPS)),
            0
          );
          return {durationInFrames: Math.max(1, frames)};
        }}
      />
    </>
  );
};
