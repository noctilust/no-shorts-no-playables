# No Shorts, No Playables

A Chrome Manifest V3 extension that removes YouTube Shorts and YouTube Playables.

## Install

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select this `extension/` directory.

Chrome 137+ no longer supports `--load-extension` for branded Chrome; use the
Load unpacked flow. Reload the extension after editing files. The extension is
scoped to `www.youtube.com`; YouTube Music, embeds, and ordinary `/watch`
videos are untouched.

## Behavior

| Surface | Action |
| --- | --- |
| `/shorts/<id>` | Redirects to `/watch?v=<id>` |
| `/shorts`, `/shorts/` | Redirects to the YouTube home page |
| `/<channel>/shorts` | Redirects to `/<channel>/videos` |
| `/playables`, `/playables/<id>` | Redirects to the YouTube home page |
| Shorts shelves, cards, tabs, guide entries | Hidden |
| Playables shelves, cards, guide entries | Hidden |
| Search `Shorts` / `Playables` chips | Hidden; an active Shorts filter is reset to `All` |

Shorts links are unwrapped to the normal watch player rather than blocked
outright, so shared Shorts links still resolve. Playables has no normal-watch
equivalent, so it is redirected home.

## Verification

After loading the extension, check:

- `https://www.youtube.com/shorts/` returns to `https://www.youtube.com/`.
- A direct `https://www.youtube.com/shorts/<id>` URL ends at
  `https://www.youtube.com/watch?v=<id>`.
- `https://www.youtube.com/playables` ends at `https://www.youtube.com/`.
- `https://www.youtube.com/@Fireship/shorts` ends at
  `https://www.youtube.com/@Fireship/videos`.
- Search results contain no visible `a[href^="/shorts/"]` cards.
- The home page contains no Playables shelf or `ytd-mini-game-card-view-model`.

The URL redirect is the invariant; the CSS selectors are cosmetic and may need
updating if YouTube changes its custom-element names. URL blocking does not
depend on the DOM.
