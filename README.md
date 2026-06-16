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

## Verify the render pipeline
```sh
npm run test:render
```
Renders `TestComp` to `output/test-render.mp4`.

## Stack
Node.js + Remotion. **npm only** (no Yarn/pnpm). Windows / `E:` drive.
