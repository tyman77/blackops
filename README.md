# Black Ops

Internal command center for the team's special projects. Each initiative is an
"operation" with a vision, mission, objectives, measurable outcomes, phases,
team, risks and an intel log.

## Framework

Black Ops runs on **The Algorithm** from Jon McNeill's *The Algorithm: The Hypergrowth Formula
That Transformed Tesla, Lululemon, General Motors and SpaceX*: question every requirement,
delete, simplify, accelerate, automate, in that order. Every objective in `data.js` carries a
`step`, which places it under that step in the project file's *How we're running it* section.

## Views

The page answers four questions for the whole team, in order:

- **Hero**: the summit image (`HERO_IMAGE` in `data.js`, default `assets/summit.jpg`), the
  mandate, the Algorithm in one line, projects in motion, wins so far and what's up next.
- **01 Vision · Where we're going**: a card per project with its vision, headline targets and
  current phase. Filter by status; on desktop the section pins and scrolling slides the cards.
- **02 Now · Happening now**: each project's current phase (how far through, when it ends) and
  its latest update.
- **03 Done · Done so far**: counters (moves done, outcomes delivered, phases complete, Apex
  releases) and a wall of every win, delivered outcomes first.
- **04 Next · Coming up**: dated milestones (phases starting, current phases wrapping up,
  objectives with a due date), then how many moves are on deck.
- **Project file**: click any project. It reads Vision, Now, Done, Next, then the team. Two folded
  sections hold the detail: *How we're running it* (the project's objectives under each Algorithm
  step) and *The full record* (mission, phases, every outcome, risks, release plan, #apex
  feedback and every update). `←` / `→` move between files, `Esc` closes.
- **Search**: `⌘K`, `Ctrl+K` or `/` searches codenames, project names, people and pillars.

Everything is derived from `data.js`: Now uses the phase that contains `asOf`, Done counts
objectives with `done: true`, outcomes with `state: "met"` and phases that have ended, and Next
lists phases that start after `asOf`, current phases' end dates and open objectives with a `due`.

Each operation can state its goals up front: `vision`, an optional `shift` ({ from, to }) and
`targets` (headline numbers). They lead the operation's file and the targets show on its card.

Operations can carry an optional `feedback` block (APEX uses it, fed from the #apex Slack channel):
releases shipped plus every ask from the team, tagged by theme and kind, rendered as a chart and
changelog in the operation's file.

Operations can carry an optional `plan` (release plan): headline stats plus a done-vs-left
hours bar per workstream. Topo uses it, read from the release board in the Topo2 Supabase project.

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

## Hosting and sign-in

Hosted on Vercel (team Summit Integrated System, project `blackops`) at
https://blackops.summitintegrated.com, deploying on every push to this branch.

Every request goes through `middleware.js`, which serves nothing (including `data.js`) without a
valid `bo_session` cookie. People sign in on `/login` with Google (Summit Workspace accounts) or
an emailed magic link, both handled by the Apex Supabase project. `/auth/callback` passes the
Supabase token to `/api/auth/session`, which confirms the user with Supabase, checks the email is
`@summitintegrated.com`, and sets a signed, HTTP-only cookie for 30 days. `/api/auth/logout` ends it.

Environment variables (Vercel): `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `ALLOWED_DOMAIN`, `AUTH_SECRET`.
Changing `AUTH_SECRET` signs everyone out.

## Motion

`motion.js` adds the scroll motion on top of the page: smooth wheel scrolling on desktop
([Lenis](https://github.com/darkroomengineering/lenis), MIT, vendored in `vendor/`), an
altimeter that climbs to the summit as you scroll, the hero pushing into the mountain, the files
pinning and sliding sideways, titles rising out of a mask, a fuse that lights the Algorithm steps
in order, timeline bars drawing in, and the footer wordmark filling with light. Nothing runs when
the viewer has Reduce Motion turned on, and the page works the same without the file.

## On iPhone

The same address works on phones with a layout of its own: sections move to a tab bar at the
bottom, the files stack vertically, the Algorithm steps swipe sideways with tabs to jump between
them, the timeline becomes a phase list, and a file's Prev / Close / Next sit at the bottom.

To install it: open https://blackops.summitintegrated.com in Safari, tap Share, then
**Add to Home Screen**. It opens full screen with the mountain icon. The Home Screen app keeps its
own sign-in, so sign in once inside it with **Continue with Google** (emailed links open in Safari,
not the app).

## Daily updates

A scheduled Claude session runs every weekday at about 6:45 AM Central and follows
`ops/daily-update.md`: it reads new posts in #project_black_ops and #apex, new Black Ops meeting
notes in ClickUp, and Topo's release board (the Topo2 Supabase project, read only), updates
`data.js`, runs `node scripts/check-data.cjs`, commits, pushes and republishes the page.
`SYNC` in `data.js` records how far each source has been read. Edit the runbook to change the rules.

## Easter eggs (don't spoil them for the team)

- Konami code (↑ ↑ ↓ ↓ ← → ← → B A), or type `summit` anywhere: the Summit Integrated Systems card.
- Triple-click the summit in the hero to plant a flag.
- Hover the `SBO` mark, or the giant outlined BLACK OPS in the footer.
- Double-click the red classification bar.
- Search for `summit`.
- Open the browser console.
