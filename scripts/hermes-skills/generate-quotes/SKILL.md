---
name: generate-quotes
description: Generate batches of raw, cinematic motivational phrases for a given theme, as structured JSON for the video renderer (Spec 4).
---

# generate-quotes

Project-local prompt contract for the AI YouTube channel's quote generator. This file is
the **single source of truth** for the generation rules: `scripts/generate-quotes.js` reads
the canonical prompt out of the `PROMPT_START`/`PROMPT_END` block below and sends it to the
Anthropic Messages API. Do not duplicate the rules in the script — edit them here.

## Trigger
Given a **theme** string (e.g. `"grinding in obscurity"`), produce 10 on-brand motivational
phrases for the channel's audience: self-taught solo entrepreneurs building wealth online,
alone, from scratch — side hustlers grinding in obscurity who rejected the traditional path.

## Output schema
The model returns a **single JSON object only** (no preamble, no markdown fences):

```json
{
  "theme": "grinding in obscurity",
  "generated_at": "2024-01-15T10:30:00Z",
  "phrases": [
    {
      "text": "Nobody is watching. Build anyway.",
      "style": "short",
      "emotion": "defiant",
      "screen_duration_seconds": 4
    }
  ]
}
```

`generate-quotes.js` overrides `theme` and `generated_at` with authoritative values after
parsing, so the model's job is the `phrases` array. Each phrase object must have exactly:
`text` (string), `style` (`short`|`medium`|`long`), `emotion` (one of the allowed tags), and
`screen_duration_seconds` (integer).

## Generation rules (canonical prompt)
Everything between the two markers below is sent verbatim as the API **system prompt**.

<!-- PROMPT_START -->
You write short, powerful motivational phrases for a faceless YouTube channel.

Audience: self-taught solo entrepreneurs building wealth through internet and online business —
alone, from scratch, figuring it out as they go. Side hustlers, aspiring digital nomads, and
solo builders who rejected the 9-to-5 and are grinding in obscurity. Write for one person
sitting alone at a laptop at 2am — not for a corporate motivational poster.

Voice: raw, direct, cinematic. Earned resolve, not hype. Examples of the target register:
- "Nobody is coming to save you. Build it yourself."
- "The internet doesn't care where you started. Only where you're going."
- "One day the grind becomes the empire."
- "Stop waiting for permission. The door was never locked."
- "Every empire started as a tab open at 2am."

Given a theme, generate EXACTLY 10 phrases. Rules:
- Style mix: at least 3 "short" (<= 8 words), at least 3 "medium" (9-15 words), up to 4 "long" (16-25 words).
- Each phrase's "style" field must accurately match its word count per the bands above.
- "emotion" must be exactly one of: defiant, determined, urgent, hopeful, raw, cinematic.
- "screen_duration_seconds" by style: short = 3 or 4, medium = 5 or 6, long = 7 or 8.
- FORBIDDEN — never use these words or phrases (case-insensitive): hustle, grind harder,
  believe in yourself, dream big, never give up, you got this, crush it, mindset.
  (The word "grind" alone is allowed; "grind harder" is not.)
- No hashtags. No emojis. No exclamation marks.
- Every phrase must feel written for someone alone at a laptop at 2am, not a poster.

Output a SINGLE valid JSON object and NOTHING else — no preamble, no commentary, no markdown
code fences. The object has keys "theme" (string), "generated_at" (ISO-8601 UTC string), and
"phrases" (array of 10 objects, each with "text", "style", "emotion",
"screen_duration_seconds"). Output must parse with JSON.parse on the first try.
<!-- PROMPT_END -->

## Consumed by
- `scripts/generate-quotes.js` (Part B) — reads the block above, calls the Anthropic SDK,
  writes `quotes/<sanitized_theme>_<YYYYMMDD_HHmmss>.json`, and upserts `quotes/manifest.json`.
- Spec 4 (video renderer) — reads the generated quote JSON files to place text on screen.
