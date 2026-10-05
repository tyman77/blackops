# Daily update runbook

A scheduled Claude session runs this every weekday morning (about 6:45 AM Central).
It reads what changed in the sources below, updates `data.js`, checks it, commits,
pushes, and republishes the page. Humans can edit this file to change what it does.

Branch: `claude/black-ops-project-dashboard-l78hin` in `tyman77/blackops`.
Live site: https://blackops.summitintegrated.com (Vercel deploys every push to this branch
automatically, so step 4 is what updates it).
Backup page: `SYNC.artifactUrl` in `data.js` (republished in step 5).

## 0. Start

1. `git fetch origin claude/black-ops-project-dashboard-l78hin && git checkout claude/black-ops-project-dashboard-l78hin && git pull`
2. Read `data.js`, especially `SYNC` (what has already been read) and the operations.
3. Today's date in Central time is the new `asOf`.

## 1. Read the sources (only what is new since `SYNC`)

**#project_black_ops** (`SYNC.slack.blackops`): read the channel with `oldest` = `lastTs`.
Open threads that have replies. Look at attached screenshots when a message depends on them.

**#apex** (`SYNC.slack.apex`): same, with `oldest` = `lastTs`.

**Meeting notes** (`SYNC.clickup`): search ClickUp for docs titled like
"Project Black Ops Updates - MM/DD/YYYY". Any doc id not in `knownDocs` is new. Read its
summary page (not the transcript unless something is unclear).

**Topo progress** (`SYNC.topo`): read the release board straight from the Topo2 Supabase
project (`SYNC.topo.supabaseProject`) with the Supabase connector's `execute_sql`. Read only;
never write to it. The release plan PDF is printed from these same tables.

```sql
-- headline numbers: v1 scope, cut items excluded
select status, count(*) n, sum(hours) h
from topo_release_items where release = 'v1' and status <> 'cut' group by status;
-- per workstream
select area, sum(hours) filter (where status <> 'done') left_h, sum(hours) total_h
from topo_release_items where release = 'v1' and status <> 'cut' group by area;
-- parked past v1
select release, sum(hours) h from topo_release_items
where release in ('later', 'maybe') and status <> 'cut' group by release;
-- has anything moved?
select max(updated_at) from topo_release_items;
```

How the numbers map onto the TOPO `plan`:
- Left to v1 = hours of `todo` + `review` + `blocked`. Working weeks = left / 40.
- Done by hours = `done` hours / (`done` + left). Items done = `done` count / all four counts.
- Ready for review = `review` count and hours. Blocked on someone = `blocked` count.
- Streams: one per area, dropping the number prefix ("01 Schematic" is "Schematic"). Fold
  "06 Rack elevations" into "Racks" and the three app areas into "iOS / Android / Mac apps".
- Parked = `later` + `maybe` hours; the `maybe` hours are the conditional part.

If `max(updated_at)` is not newer than `SYNC.topo.lastChange`, nothing moved: only set
`SYNC.topo.lastChecked` and the plan `source` date. Otherwise update the stats, streams, parked
note and `source`, the percentages in TOPO's objective text, its "Progress to v1" and "Time left to
v1" outcomes, add one intel entry with `doc: "Topo release board"`, and set `lastChange`.
The workstream reports in `topo_release_areas.last_report` explain what moved; use them for the
intel text in plain words, never pasted.

If a source can't be reached, don't guess. Skip it, leave its cursor where it was, and say
which source failed in the summary.

## 2. Update `data.js`

Map everything to the operation it belongs to (see each operation's title, mission and
objectives). Rules:

- **Never invent numbers, dates or owners.** Only record what a source states. If a target or
  date is unclear, leave it as it is and mention it in the summary.
- **Intel:** add one dated entry per real update (not chatter or thanks) to the operation's
  `intel`, newest first, with its source: `src: "<meeting key>"` for meetings,
  `slack: "p<ts without the dot>"` for #project_black_ops, and `slack: ..., ch: "apex"` for #apex.
- **Objectives:** tick `done: true` only when a source says the thing is done. New commitments
  from meeting "Next Steps" become objectives with `owner` (first name) and a `step`
  (question, delete, simplify, accelerate, automate: the Algorithm step it serves).
- **New meeting:** add it to `MEETINGS` with a short key (MMDD), date, url, attendees and a
  one-sentence summary, then add its doc id to `SYNC.clickup.knownDocs`.
- **#apex:** release announcements (usually from Tyson) go in APEX `feedback.shipped`. Requests,
  bug reports and access problems go in `feedback.asks` with `theme` (reuse an existing theme
  name) and `kind` (feature | bug | access). If a release answers an earlier ask, set that ask's
  `answered` to the release date. Update `feedback.until`. Keep APEX outcome and risk text that
  quotes counts (asks, releases, weeks) in line with the new totals.
- **Topo:** update the TOPO `plan` stats, `streams` hours and `source` date, the percentages in
  its objective text, and its "Progress to v1" and "Time left to v1" outcomes.
- **Status:** change an operation's `status` only when a source clearly says so.
- Client project names (churches, venues) are wrapped in `[[...]]` so they show redacted.
- Write plainly, in the same voice as the existing entries.
- Set `asOf` to today and advance `SYNC`: each channel's `lastTs` to the newest message read,
  `SYNC.lastRun` to today, `SYNC.topo.lastChecked` if Topo was read.

If nothing changed in any source, only advance `SYNC.lastRun` and `asOf`.

## 3. Check

- `node scripts/check-data.cjs` must print `data.js OK`. Fix any problem it lists.
- `node --check app.js`

Do not publish if either fails; report the error instead.

## 4. Commit and push

Commit with a message that says what changed ("Daily sync 26 Sep: 3 #apex asks, 1 release,
Topo 62% to v1"), then `git push origin claude/black-ops-project-dashboard-l78hin`.

## 5. Republish

1. `./scripts/build-artifact.sh`
2. Read the live page first with the Artifact tool (`action: "read"`, `url` = `SYNC.artifactUrl`).
3. Publish with the Artifact tool: `url` = `SYNC.artifactUrl`, `file_path` = `dist/black-ops.html`,
   `files` = `{ "data.js": "dist/data.js", "app.js": "dist/app.js", "motion.js": "dist/motion.js", "vendor/lenis.min.js": "dist/vendor/lenis.min.js" }`. Add
   `"assets/summit.jpg": "dist/assets/summit.jpg"` only if that image changed.

## 6. Summary

End with a short summary for Tyson: what was added per operation, anything ticked off, any
source that failed or was skipped, and anything that needs a human decision.
