# Daily update runbook

A scheduled Claude session runs this every weekday morning (about 6:45 AM Central).
It reads what changed in the sources below, updates `data.js`, checks it, commits,
pushes, and republishes the page. Humans can edit this file to change what it does.

Branch: `claude/black-ops-project-dashboard-l78hin` in `tyman77/blackops`.
Live page: `SYNC.artifactUrl` in `data.js`.

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

**Topo progress** (`SYNC.topo.url`): if the url is set, open it and read the release plan
headline numbers (hours left to v1, working weeks, % done by hours, items done, ready for
review, blocked) and the per-workstream hours left / total. If the url is null, skip this
step and say so in the summary.

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

- `node scripts/check-data.js` must print `data.js OK`. Fix any problem it lists.
- `node --check app.js`

Do not publish if either fails; report the error instead.

## 4. Commit and push

Commit with a message that says what changed ("Daily sync 26 Sep: 3 #apex asks, 1 release,
Topo 62% to v1"), then `git push origin claude/black-ops-project-dashboard-l78hin`.

## 5. Republish

1. `./scripts/build-artifact.sh`
2. Read the live page first with the Artifact tool (`action: "read"`, `url` = `SYNC.artifactUrl`).
3. Publish with the Artifact tool: `url` = `SYNC.artifactUrl`, `file_path` = `dist/black-ops.html`,
   `files` = `{ "data.js": "dist/data.js", "app.js": "dist/app.js" }`. Add
   `"assets/summit.jpg": "dist/assets/summit.jpg"` only if that image changed.

## 6. Summary

End with a short summary for Tyson: what was added per operation, anything ticked off, any
source that failed or was skipped, and anything that needs a human decision.
