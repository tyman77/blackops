# Black Ops

Internal command center for the team's special projects. Each initiative is an
"operation" with a vision, mission, objectives, measurable outcomes, phases,
team, risks and an intel log.

## Views

- **Hero**: a single spotlit 3D object (Three.js). Drag to rotate; the light follows the pointer.
- **The Files**: horizontal reel of every operation. Filter by status, scroll sideways with the wheel or arrows.
- **Radar**: impact vs effort, sorted into Quick strikes, Major campaigns, Side missions and Rethink.
- **Timeline**: every phase across months with a "today" line.
- **Intel log**: latest field reports across all operations.
- **Dossier**: click any operation for its full file. `←` / `→` move between files, `Esc` closes.
- **Search**: `⌘K`, `Ctrl+K` or `/` searches codenames, project names, people and pillars.

Deep links: `index.html#BO-003` opens that file directly.

## Updating content

All content lives in `data.js`. Edit an entry or copy one to add an operation.
Wrap text in `[[double brackets]]` to render it as a redaction bar that reveals on hover.

The six project names are real; dates, metrics, teams and intel are placeholders.

## Running it

It's a static site with no build step. Open `index.html` through any static server, for example:

```
python3 -m http.server 8000
```

Then visit http://localhost:8000. Deploys as-is to Vercel, Netlify, GitHub Pages or an internal server.
