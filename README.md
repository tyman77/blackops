# Black Ops

Internal command center for the team's special projects. Each initiative is an
"operation" with a vision, mission, objectives, measurable outcomes, phases,
team, risks and an intel log.

## Framework

Black Ops runs on **The Algorithm** from Jon McNeill's *The Algorithm: The Hypergrowth Formula
That Transformed Tesla, Lululemon, General Motors and SpaceX*: question every requirement,
delete, simplify, accelerate, automate, in that order. Every objective in `data.js` carries a
`step`, which drives the Algorithm section, the five-step strip on each card, and the step tag
on each objective.

## Views

- **Hero**: the summit image (`HERO_IMAGE` in `data.js`, default `assets/summit.jpg`, generated in Grok) with one
  light glowing behind it that follows the pointer. A light background is removed automatically,
  so a black-on-white illustration sits on the black page; an image on black blends straight in.
  A tall image fills the right side of the hero; a wide one sits upper right. Swap the file to change the mountain.
- **The Ascent**: every operation planted as a flag on one ridge, from Base Camp through
  Camps I–III to the Summit, by share of objectives cleared. Live and complete operations stand on the summit.
- **The Files**: horizontal reel of every operation. Filter by status, scroll sideways with the wheel or arrows.
- **Radar**: impact vs effort, sorted into Quick strikes, Major campaigns, Side missions and Rethink.
- **Timeline**: every phase across months with a "today" line.
- **Intel log**: latest field reports across all operations.
- **Dossier**: click any operation for its full file. `←` / `→` move between files, `Esc` closes.
- **Search**: `⌘K`, `Ctrl+K` or `/` searches codenames, project names, people and pillars.

Operations can carry an optional `plan` (release plan): headline stats plus a done-vs-left
hours bar per workstream. Topo uses it, fed from the Topo Release Plan.

Deep links: `index.html#BO-003` opens that file directly.

## Updating content

All content lives in `data.js`. Edit an entry or copy one to add an operation.
Wrap text in `[[double brackets]]` to render it as a redaction bar that reveals on hover.

Content comes from the Black Ops sync notes (08/11, 09/08, 09/22/2026) in ClickUp and the
#project_black_ops Slack channel. Reference a Slack post from an intel entry with `slack: "p<ts>"`. Codenames,
impact/effort scores and phase end dates are estimates. Add a meeting to `MEETINGS` and
reference it from an intel entry with `src` to link the update back to its notes.

## Running it

It's a static site with no build step. Open `index.html` through any static server, for example:

```
python3 -m http.server 8000
```

Then visit http://localhost:8000. Deploys as-is to Vercel, Netlify, GitHub Pages or an internal server.
