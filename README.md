# AI-YouTubeChannelProject

An AI-automated motivational YouTube channel. No voiceover, no narration, no teaching —
the format is **cinematic stock footage + animated motivational text overlays +
royalty-free music**, rendered to MP4 via [Remotion](https://www.remotion.dev/).

## Niche
> Motivating self-taught solo entrepreneurs building wealth through internet and online
> business — alone, from scratch.

## Pipeline (6 specs)
1. **Spec 1 — Project scaffold + Remotion test render** *(this commit)*: project structure, Git, a working Remotion project, and a rendered `TestComp` proving the render pipeline works end-to-end.
2. **Spec 2 — Footage sourcer**: pull cinematic stock clips from the Pexels API into `footage/`.
3. **Spec 3 — Quote/phrase generator**: a Hermes skill that generates on-niche motivational lines as JSON into `quotes/`.
4. **Spec 4 — Motion video renderer**: Remotion composition combining footage + animated text + music into a finished MP4 in `output/`.
5. **Spec 5 — Thumbnail generator**: generate thumbnail PNGs into `thumbnails/`.
6. **Spec 6 — YouTube upload + orchestration**: upload finished videos and orchestrate the whole pipeline on a Hermes cron schedule.

## Layout
```
remotion\      Remotion project (motivation-renderer)
footage\       downloaded stock video clips (gitignored)
music\         background music tracks (gitignored)
output\        rendered MP4s staging area (gitignored)
thumbnails\    generated thumbnail PNGs
scripts\       Python/Node utility scripts
quotes\        generated quote JSON files
```

## Setup
These steps populate the gitignored asset folders and secrets a fresh checkout needs:

1. **Secrets** — copy `.env.example` to `.env` and fill `PEXELS_API_KEY` (Spec 2) and `ANTHROPIC_API_KEY` (Spec 3).
2. **Footage** — `npm run fetch:footage -- "<keyword>"` downloads stock clips into `footage/`.
3. **Quotes** — `npm run generate:quotes -- "<theme>"` writes phrase JSON into `quotes/`.
4. **Music** *(one-time, manual)* — the renderer (Spec 4) looks for an `.mp3`/`.wav` in `music/`.
   Download a royalty-free track from <https://pixabay.com/music/> (search *"epic motivational instrumental"*)
   and save it as `music/track-01.mp3`. Music files are gitignored, so each checkout must add its own.
   If `music/` is empty the video still renders — silently.

## Verify the render pipeline
```sh
npm run test:render                                   # Spec 1: renders TestComp -> output/test-render.mp4
npm run render:video -- "grinding in obscurity"       # Spec 4: renders MotivationVideo from quotes + footage
npm run generate:thumbnail -- --theme "grinding in obscurity"  # Spec 5: 1280x720 thumbnail PNG
npm run produce -- "grinding in obscurity"            # Spec 5: render + thumbnail in one command
```

> **Thumbnail dependency note:** Spec 5 uses **`node-canvas`** (`canvas`) for compositing — it
> installed cleanly with prebuilt binaries on this machine (Node 24, no build tools needed).
> If a future `npm install` of `canvas` fails to build, swap to the drop-in `@napi-rs/canvas`.

## Stack
Node.js + Remotion. **npm only** (no Yarn/pnpm). Windows / `E:` drive.
