import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Loop,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export interface Phrase {
  text: string;
  style: "short" | "medium" | "long";
  emotion: string;
  screen_duration_seconds: number;
}

export interface Clip {
  id: string;
  // Path RELATIVE to the Remotion public dir. The render passes --public-dir=<project root>
  // so e.g. "footage/123.mp4" resolves via staticFile(). OffthreadVideo serves assets over
  // the bundler's HTTP server, so raw absolute / file:// paths fail — staticFile is required.
  file: string;
  duration: number;
  width: number;
  height: number;
}

// Must be a `type` (not an interface) so Remotion's Composition can bind it as props.
export type MotivationVideoProps = {
  phrases: Phrase[];
  clips: Clip[];
  musicFile?: string;
  theme: string;
};

export const FPS = 30;
const FADE = 20; // text fade in/out (frames)
const CROSSFADE = 10; // scene-to-scene crossfade overlap (frames)

type StyleSpec = {
  fontSize: number;
  letterSpacing: string;
  color: string;
  transform: "uppercase" | "title" | "none";
  maxWidth: string;
};

const STYLE_MAP: Record<Phrase["style"], StyleSpec> = {
  short: { fontSize: 72, letterSpacing: "0.08em", color: "#FFFFFF", transform: "uppercase", maxWidth: "85%" },
  medium: { fontSize: 52, letterSpacing: "0.04em", color: "#F5F5F5", transform: "title", maxWidth: "80%" },
  long: { fontSize: 38, letterSpacing: "0.02em", color: "#EEEEEE", transform: "none", maxWidth: "75%" },
};

function titleCase(s: string): string {
  return s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

const sceneFramesFor = (p: Phrase): number =>
  Math.max(1, Math.round(p.screen_duration_seconds * FPS));

const Scene: React.FC<{ phrase: Phrase; clip: Clip; index: number; sceneFrames: number }> = ({
  phrase,
  clip,
  index,
  sceneFrames,
}) => {
  const frame = useCurrentFrame();
  const even = index % 2 === 0;

  // Ken Burns: even scenes zoom in (1 -> 1.08), odd scenes zoom out (1.08 -> 1).
  const scale = even
    ? interpolate(frame, [0, sceneFrames], [1, 1.08], { extrapolateRight: "clamp" })
    : interpolate(frame, [0, sceneFrames], [1.08, 1], { extrapolateRight: "clamp" });

  // Scene-level opacity drives the crossfade: fade in over the first CROSSFADE frames,
  // hold, fade out over the trailing CROSSFADE frames (which overlap the next scene's
  // fade-in because the Sequence is CROSSFADE frames longer than sceneFrames).
  const sceneOpacity = interpolate(
    frame,
    [0, CROSSFADE, sceneFrames, sceneFrames + CROSSFADE],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Text: fade in 0->FADE, hold, fade out over the last FADE frames, plus a subtle lift.
  const textOpacity = interpolate(
    frame,
    [0, FADE, sceneFrames - FADE, sceneFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const translateY = interpolate(frame, [0, FADE], [12, 0], { extrapolateRight: "clamp" });

  const st = STYLE_MAP[phrase.style] ?? STYLE_MAP.medium;
  const display =
    st.transform === "uppercase"
      ? phrase.text.toUpperCase()
      : st.transform === "title"
        ? titleCase(phrase.text)
        : phrase.text;

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity, backgroundColor: "#000000" }}>
      {/* Footage — fills the frame (object-fit cover) with a slow Ken Burns zoom.
          OffthreadVideo has no `loop` prop in this Remotion version, so <Loop>
          repeats the clip when it is shorter than the scene. */}
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <Loop durationInFrames={Math.max(1, Math.round(clip.duration * FPS))} layout="none">
          <OffthreadVideo
            src={staticFile(clip.file)}
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Loop>
      </AbsoluteFill>

      {/* Readability gradient over the bottom 60%. */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.65) 100%)",
        }}
      />

      {/* Centered text. */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            opacity: textOpacity,
            transform: `translateY(${translateY}px)`,
            fontFamily: "Arial, Helvetica, system-ui, sans-serif",
            fontWeight: 700,
            fontSize: st.fontSize,
            letterSpacing: st.letterSpacing,
            color: st.color,
            textAlign: "center",
            maxWidth: st.maxWidth,
            lineHeight: 1.25,
            textShadow: "0 2px 24px rgba(0,0,0,0.8)",
            padding: "0 40px",
          }}
        >
          {display}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const MotivationVideo: React.FC<MotivationVideoProps> = ({ phrases, clips, musicFile }) => {
  const { durationInFrames } = useVideoConfig();

  let from = 0;
  const scenes = phrases.map((phrase, i) => {
    const sceneFrames = sceneFramesFor(phrase);
    const clip = clips.length ? clips[i % clips.length] : undefined;
    const start = from;
    from += sceneFrames;
    return { phrase, clip, start, sceneFrames, i };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {scenes.map(({ phrase, clip, start, sceneFrames, i }) =>
        clip ? (
          <Sequence key={i} from={start} durationInFrames={sceneFrames + CROSSFADE}>
            <Scene phrase={phrase} clip={clip} index={i} sceneFrames={sceneFrames} />
          </Sequence>
        ) : null
      )}

      {musicFile ? (
        <Audio
          src={staticFile(musicFile)}
          loop
          volume={(f) =>
            interpolate(
              f,
              [0, 45, Math.max(46, durationInFrames - 90), durationInFrames],
              [0, 0.35, 0.35, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            )
          }
        />
      ) : null}
    </AbsoluteFill>
  );
};
