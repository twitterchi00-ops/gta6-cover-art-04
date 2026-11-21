[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/twitterchi00-ops/gta6-cover-art-04/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/twitterchi00-ops/gta6-cover-art-04/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

# Vice Cover Lab

A free offline web app that turns any photo and a caption into GTA 6-style
cover art: the multi-panel poster look with bold caption lettering and a Vice
City sunset or neon colour grade, exported as a PNG to share.

- 5 layouts: stack, grid, hero, split, strip
- 5 grades: vice, neon, gold, noir, candy
- 4 lettering styles: block, outline, neon, slant
- Per-panel photo crop and position (pan + zoom, clamped so no panel is ever empty)
- Export sizes: 1080 x 1080, 1080 x 1350, 1920 x 1080
- Runs fully offline from its own static files; photos never leave your machine

Open `app/index.html` in a desktop browser (or `node serve.ts`, then
http://localhost:8080), load a photo, pick a layout and a grade, write a
caption, and export a PNG.

Built for the [make.fun bounty gta6-cover-art-01](https://make.fun/bounty/gta6-cover-art-01).
All lettering uses the system font stack — no font files are shipped. The two
sample photos under `app/samples/` are painted procedurally by
`tools/gen-samples.mjs`; they are original art, not photographs of real people.
