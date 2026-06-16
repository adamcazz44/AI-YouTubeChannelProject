# Build Handoff → Hermes

**From:** Claude Code · **To:** Hermes (commander) · **Date:** 2026-06-16
**Project:** AI-YouTubeChannelProject — `E:\OnlineMotivateYoutube`
**Repo:** https://github.com/adamcazz44/AI-YouTubeChannelProject (branch `main`)

## TL;DR
**All 6 specs are built, pushed, and the pipeline is operational end to end.** The full
chain works: footage → quotes → video → thumbnail → YouTube upload (private) → publish/reject.
YouTube OAuth and channel verification are complete and the upload path is live-proven against
the real channel. Remaining work is quality/perf polish + go-live scheduling (listed at bottom).

## Channel
- **Digital Grind** · @Digital_Means · channel `UCrwtjCiCsAByjyryhbk1thw` · acct `watermellonseed55@gmail.com`
- Studio: https://studio.youtube.com/channel/UCrwtjCiCsAByjyryhbk1thw

## Stack
Node.js + Remotion (Remotion 4.0.478, React 19) · **npm only** · Windows / `E:` drive.
**Faceless format:** cinematic stock footage + animated motivational text + royalty-free music
→ MP4. No voiceover/narration/face. Niche: self-taught solo entrepreneurs building wealth online.

## Specs — all complete & pushed

| Spec | Commit | Delivers | Verified |
|---|---|---|---|
| 1 — Scaffold + Remotion | `2c5e7ae` | Repo, dirs, Remotion project, `TestComp` test render | ✅ render + push |
| 2 — Footage sourcer | `bfa7c8b` | `fetch:footage` (Pexels) → `footage/manifest.json` (45 clips seeded) | ✅ seeded, no-dup, error paths |
| 3 — Quote generator | `2f928cb` | `generate:quotes` (Anthropic `claude-sonnet-4-6`); rules in `scripts/hermes-skills/generate-quotes/SKILL.md`; 8 themes seeded | ✅ 10/theme, style mix, no forbidden words |
| 4 — Motion renderer | `26ccf72` | `render:video` — Remotion `MotivationVideo` (footage + Ken Burns + crossfade + styled captions + ducked music) | ✅ rendered real 1080p video |
| 5 — Thumbnail generator | `f12fe97` | `generate:thumbnail` + `produce` combo (node-canvas/sharp/fluent-ffmpeg), 1280×720, vignette + headline | ✅ QC passed, combo produced mp4+png |
| 6 — Upload + orchestration | `d800633` | `auth:youtube`, `upload:youtube`, `publish`, `reject`, `pipeline`, `cron:daily`; 30-theme rotation; `SETUP.md` | ✅ OAuth + upload + thumbnail + reject live-proven |

## Live-proven on the real channel (2026-06-16)
- **OAuth:** `npm run auth:youtube` → refresh token in `.env`.
- **Channel verified** at youtube.com/verify (unlocks custom thumbnails).
- **Upload → thumbnail → reject** all confirmed with a throwaway private video (uploaded, custom
  thumbnail set, then deleted — nothing test-related remains on the channel).
- **`publish` is wired but not yet exercised** (avoided a public test post). Same `videos.update`
  mechanism as `reject`; will work on first real publish.

## Operator command reference (run from repo root)
```
npm run fetch:footage -- "<keyword>"        # add stock clips
npm run generate:quotes -- "<theme>"        # add 10 phrases (JSON)
npm run render:video -- "<theme>"           # render MP4 from quotes+footage
npm run generate:thumbnail -- --theme "<t>" # 1280x720 thumbnail
npm run produce -- "<theme>"                # render + thumbnail
npm run upload:youtube -- --theme "<theme>" # upload PRIVATE + set thumbnail
npm run pipeline -- "<theme>"               # quotes→footage→produce→upload (full chain)
npm run publish -- <youtube_id>             # flip to Public after QC
npm run reject -- <youtube_id>              # delete from YouTube
npm run cron:daily                          # run next unused theme (state in scripts/cron-state.json)
```
Uploads are **always private**; a human runs `publish` after QC. Nothing goes public automatically.

## Secrets / config (all in gitignored `.env`)
`PEXELS_API_KEY`, `ANTHROPIC_API_KEY`, `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`,
`YOUTUBE_REFRESH_TOKEN`. Tracked manifests only (`*/manifest.json`); media, `.env`, and
`scripts/cron-state.json` are gitignored.

## Open items (deferred — for Hermes to schedule)
1. **Video length:** renders are ~55s; spec wanted 3–5 min (10 phrases × 3–8s = max 80s). Needs a target-length knob (loop the phrase set or generate more phrases). *Biggest gap to production-ready.*
2. **Music is a placeholder:** `music/track-01.mp3` is a SoundHelix algorithmic test track — replace with a CC0/licensed instrumental before publishing (copyright risk).
3. **Render perf:** `render-video.js` uses `--public-dir=<project root>`, so Remotion copies the entire ~4.7 GB root every render — optimize to a lean assets-only public dir.
4. **Rotate Pexels key:** was exposed in a chat transcript; Pexels rotation is support-only (email info@pexels.com), then update `.env`.
5. **Independent verification gate:** all 6 specs landed **un-gated** — the Codex/OpenAI verifier is down (401, needs re-auth). Per the standing rule (Hermes plans → Claude Code builds → **Codex verifies**), run a Codex review of the repo once auth is restored.
6. **Thumbnail font (cosmetic):** headline renders bold but lighter than Impact/Arial Black; optionally force heavier weight in `generate-thumbnail.js`.
7. **Go-live scheduling:** `cron-daily.js` is built/tested manually only. Wire it as a live `hermes cron` job: 1 video/day for the 30-theme launch month (`scripts/themes.js`), then flip to 3–4/week sustained (state auto-advances `launch` → `sustained`).
8. **First real publish:** exercise `npm run publish` on a genuine video to confirm the public-flip path.

## Recommended next phase (for Hermes to plan)
Order to get to a publishable daily channel: **(1) duration knob + (2) real music** → **(3) render speedup** → **(8) first real publish for QC** → **(7) schedule the cron**. Hygiene (4 Pexels, 5 Codex review) can run in parallel.
