/*
 * BLACK OPS: initiative data.
 * Everything on the dashboard is generated from this file.
 *
 * Sourced from the Black Ops sync notes of 08/11, 09/08 and 09/22/2026 (ClickUp)
 * and the #project_black_ops Slack channel through 09/24/2026.
 * Codenames, impact/effort scores and phase end dates are planning estimates;
 * adjust them as the team firms up targets.
 *
 * Text tip: wrap words in [[double brackets]] to show them as a redaction bar
 * that reveals on hover / tap. Used here for client project names.
 *
 * status:     "recon" | "active" | "extraction" | "live" | "complete" | "hold"
 *             live = rolled out and in use, still being refined (set ongoing: true)
 * impact / effort: 1–10 (drives the Radar view)
 * objectives: { text, done, owner?, due?, step }
 *             step = which Algorithm step the move serves (see ALGORITHM)
 * outcomes:   { label, value, detail, state: "met" | "on" | "pending" | "behind" }
 * intel:      { date, text, src?, slack?, ch?, doc? }  ch: "apex" links to APEX_CHANNEL
 * feedback:   optional channel feedback { since, until, shipped[], asks[{ date, who, theme, kind, text, slack, answered? }] }
 * plan:       optional release plan { title, source, stats[], streams[{ name, left, total, note }], parked }
 *             src = key into MEETINGS; slack = message id (p + ts without the dot)
 */
window.BLACKOPS = {
  unit: "Summit Black Ops",
  mandate: "Black Ops runs on The Algorithm: question every requirement, delete, simplify, accelerate, then automate. In that order, across sales, engineering, warehouse and install.",

  // The framework, from Jon McNeill's "The Algorithm" (the five steps Elon Musk ran at Tesla and SpaceX).
  ALGORITHM: {
    source: "The Algorithm: The Hypergrowth Formula That Transformed Tesla, Lululemon, General Motors and SpaceX, by Jon McNeill",
    rule: "Run the steps in order. Automating a step that should have been deleted is the most expensive mistake.",
    steps: [
      { key: "question", name: "Question every requirement", line: "Every requirement has an owner and a reason. If nobody can defend it, it goes." },
      { key: "delete", name: "Delete", line: "Remove the step, part or tool entirely. If you never add a few back, you didn't delete enough." },
      { key: "simplify", name: "Simplify", line: "Standardize and optimize only what survived deletion." },
      { key: "accelerate", name: "Accelerate", line: "Shorten the cycle: prep earlier, pilot sooner, finish on site faster." },
      { key: "automate", name: "Automate", line: "Last, not first. Let software do what is now simple and proven." }
    ]
  },
  asOf: "2026-09-25",

  // hero art: a mountain image. A light background is removed automatically.
  HERO_IMAGE: "assets/summit.jpg",

  CHANNEL: {
    name: "#project_black_ops",
    url: "https://summitrocks.slack.com/archives/C0BTG1DMRRN",
    summary: "Day-to-day thread for the team: prototypes, kit specs, assembly proposals and things worth copying."
  },

  APEX_CHANNEL: {
    name: "#apex",
    url: "https://summitrocks.slack.com/archives/C0B64PRPUUD",
    summary: "Where the whole company asks for Apex changes, reports bugs, and hears what just shipped."
  },

  MEETINGS: {
    "0811": {
      date: "2026-08-11",
      title: "Black Ops Updates",
      url: "https://app.clickup.com/90131236057/docs/2ky3v16t-230833",
      attendees: ["Adam Hoekstra", "Travis Leatherman", "Cameron Fries", "Tyson Wiens", "Ryan Lynette", "Ben Blevins"],
      summary: "First-week check-in. Apex takes over contracts and change orders, Topo prototype previewed, pre-install prep and networked analog breakout pilots proposed."
    },
    "0908": {
      date: "2026-09-08",
      title: "Black Ops Updates",
      url: "https://app.clickup.com/90131236057/docs/2ky3v16t-252413",
      attendees: ["Levi Connell", "Jacob Cody", "Ben Thompson", "Tyson Wiens", "Cameron Fries", "Travis Leatherman"],
      summary: "CAT-to-multipin PCBs at V1/V2, TV location and kit standards, pre-made rigging slings, staging by package, Topo skeleton shown to engineers, field supply accounts opened."
    },
    "0922": {
      date: "2026-09-22",
      title: "Black Ops Updates",
      url: "https://app.clickup.com/90131236057/docs/2ky3v16t-263493",
      attendees: ["Adam Hoekstra", "Ryan Lynette", "Levi Connell", "Ben Thompson", "Tyson Wiens", "Jacob Cody", "Cameron Fries", "Travis Leatherman"],
      summary: "Nutshell exit targeting $15K/yr, nightly bill checks and AI AR emails live, Flight Plan adopted, area data model confirmed, analog-over-Cat6 PCBs arrived."
    }
  },

  OPERATIONS: [
    {
      id: "BO-001",
      codename: "COPPER LINE",
      title: "Cat6 Infrastructure",
      pillar: "Engineering",
      status: "active",
      clearance: "SECRET",
      lead: "Adam Hoekstra",
      team: ["Adam Hoekstra", "Cameron Fries", "Travis Leatherman", "Ben Thompson"],
      start: "2026-08-04",
      end: "2027-01-31",
      estimatedEnd: true,
      impact: 9,
      effort: 8,
      vision:
        "Analog audio rides on shielded Cat6 with pre-made breakouts, so nobody solders or skins a snake on site again.",
      mission:
        "Replace poor-man snakes and field terminations with networked breakouts: Cat6 to stage plates, RJ45 to DB25/XLR at the rack, and custom CAT-to-multipin and CAT-to-XLR PCBs. The rack side becomes an enclosed, modular 1RU product that expands by adding units.",
      objectives: [
        { text: "Define networked breakout architecture (RJ45 → DB25 → XLR, terminal-block RIO option)", done: true, owner: "Adam", step: "question" },
        { text: "V1 / V2 CAT-to-multipin and CAT-to-XLR PCB prototypes, incl. W1 to 3× RJ45", done: true, owner: "Cameron", step: "delete" },
        { text: "Order parts and PCBs for the first audio-over-Cat tests", done: true, owner: "Travis", step: "delete" },
        { text: "Patent check on Catalyst (Venueflex) and similar products: nothing found", done: true, owner: "Tyson & Adam", step: "question" },
        { text: "Test-fit PCB chassis connectors in plates and confirm rear mounting", done: true, owner: "Ben T.", step: "simplify" },
        { text: "Run a 150–200 ft test and validate the W1 Medusa 12-XLR breakout", done: false, owner: "Adam", step: "simplify" },
        { text: "Research grounding, pin-1, EMI, solder and corrosion standards; write a test plan", done: false, owner: "Adam", step: "question" },
        { text: "Build vs. buy standard for RJ45/DB25/XLR breakout assemblies", done: false, owner: "Adam", step: "question" },
        { text: "Enclosed modular 1RU rack unit that looks like a finished product", done: false, owner: "Cameron", step: "simplify" },
        { text: "Pilot the swap from analog to shielded Cat6 on a signed project", done: false, owner: "Cameron", step: "accelerate" }
      ],
      outcomes: [
        { label: "Prototype hardware", value: "PCBs in hand", detail: "PCBs, back boxes and pre-made Phoenix-to-XLR test cables received or on order.", state: "met" },
        { label: "Audio quality over distance", value: "150–200 ft", detail: "Target run length for the first listening and interference test.", state: "pending" },
        { label: "On-site terminations", value: "Zero solder", detail: "Pre-made harnesses and chassis connectors replace field soldering.", state: "pending" },
        { label: "Rack expandability", value: "+16 / +64", detail: "Add inputs by adding another 1RU unit.", state: "pending" }
      ],
      phases: [
        { name: "Concept", start: "2026-08-04", end: "2026-09-07" },
        { name: "Prototype", start: "2026-09-08", end: "2026-10-31" },
        { name: "Field pilot", start: "2026-11-01", end: "2027-01-31" }
      ],
      risks: [
        { text: "Grounding and pin-1 behaviour that won't show up in a lab test", sev: "high" },
        { text: "EMI, solder type and conductor material affecting signal integrity over time", sev: "med" },
        { text: "Rack unit looking like a bare panel instead of a finished product", sev: "low" },
        { text: "Off-the-shelf Cat-to-XLR systems (Catalyst, Whirlwind CATMASTER) already exist; build must beat buy", sev: "low" }
      ],
      intel: [
        { date: "2026-09-22", text: "PCBs for analog over shielded Cat6 arrived. Back boxes ordered with Lex; W1 Medusa 12-XLR breakout ordered for testing.", src: "0922" },
        { date: "2026-09-17", text: "Patent searches (Google Patents, Justia, USPTO) found nothing covering Catalyst's shielded Cat6 + XLR breakout system.", slack: "p1789671009172399" },
        { date: "2026-09-09", text: "Parts and PCBs ordered for the first audio-over-Cat tests.", slack: "p1788984673400829" },
        { date: "2026-09-08", text: "V1 PCBs in hand, V2 W1-to-3×RJ45 built. PCB chassis connectors ordered: cheaper than soldered, same exterior look.", src: "0908" },
        { date: "2026-08-25", text: "Reference products shared: Catalyst Cabling Systems and Whirlwind CATMASTER.", slack: "p1787680517495769" },
        { date: "2026-08-11", text: "Networked analog breakouts named a high-impact way to cut assembly and on-site labor.", src: "0811" }
      ]
    },
    {
      id: "BO-002",
      codename: "DRY RUN",
      title: "Shop Staging",
      pillar: "Warehouse",
      status: "active",
      clearance: "SECRET",
      lead: "Ryan Lynette",
      team: ["Ryan Lynette", "Ben Thompson", "Levi Connell", "Adam Hoekstra", "Hal"],
      start: "2026-08-04",
      end: "2026-12-31",
      estimatedEnd: true,
      impact: 8,
      effort: 5,
      vision:
        "Product arrives on site sorted by area, labeled in pull order and ready to hang, so crews install instead of rummaging.",
      mission:
        "Do the prep in the shop: palletize by area on receiving, re-inventory before shipping, pre-address and label lighting, build standard TV kits in batches, and pre-make custom cables. Assembly takes on more: plug-and-play FOH racks with interface plates, whips out of the main racks, and branded accessory and manual packs for clients.",
      objectives: [
        { text: "Stage pallets by package: PA, video, lighting, FOH", done: true, owner: "Levi", step: "simplify" },
        { text: "Pre-address, pre-clamp and pre-label lighting fixtures before shipping", done: true, owner: "Levi", step: "accelerate" },
        { text: "Area prints on every warehouse label template", done: false, owner: "Tyson", step: "simplify" },
        { text: "Re-inventory and palletize [[Flatirons]] by area", done: false, owner: "Ryan & Ben T.", step: "delete" },
        { text: "Batch pallets by area during receiving", done: false, owner: "Ben T.", step: "simplify" },
        { text: "TV mounting kit parts list defined", done: true, owner: "Ryan", step: "simplify" },
        { text: "Summit ID for the TV kit in the warehouse database, linked to its parts list", done: false, owner: "Ben T.", step: "simplify" },
        { text: "Quarterly build of 100–150 TV kits from stock", done: false, owner: "Adam & Ryan", step: "accelerate" },
        { text: "Wall-mounted pegboard converter board sample", done: false, owner: "Levi", step: "simplify" },
        { text: "Monthly pre-make of custom cables for upcoming projects", done: false, owner: "Ryan", step: "accelerate" },
        { text: "Plug-and-play FOH racks: field lines land on interface plates, looms pre-sorted to stations", done: false, owner: "Adam", step: "delete" },
        { text: "Selective whips from main racks to nearby rooms, planned during CDs", done: false, owner: "Adam & Hal", step: "accelerate" },
        { text: "Branded accessory and manual packs; accessories bagged, labeled, in a separate-colored bin", done: false, owner: "Adam", step: "simplify" }
      ],
      outcomes: [
        { label: "Lighting install labor", value: "−1 day", detail: "Pre-addressed, clamped and labeled fixtures saved one person a full day on [[WWK]].", state: "met" },
        { label: "Pallets staged by area", value: "Pilot", detail: "[[Flatirons]] pulled this week, reorganized next week, shipped in a Conex by daily pull order.", state: "on" },
        { label: "TV kit build cadence", value: "100–150 / qtr", detail: "4 zip toggles, 1/4\"-20 bolts and fender washers, 3 ft network, 2 ft SDI, 3 ft HDMI, Velcro mounts, cleaning wipe, branded box.", state: "pending" },
        { label: "FOH rack dressing on site", value: "Zero", detail: "Racks leave the shop dressed; field lines plug into interface plates.", state: "pending" }
      ],
      phases: [
        { name: "Package staging", start: "2026-08-04", end: "2026-09-21" },
        { name: "Area pilot", start: "2026-09-22", end: "2026-10-31" },
        { name: "Standard", start: "2026-11-01", end: "2026-12-31" }
      ],
      risks: [
        { text: "Pallet limits make room-level separation impossible; batching by area instead", sev: "med" },
        { text: "Room location unknown at order time until Topo backfills it", sev: "med" },
        { text: "Converter options (3G, 12G, none) multiplying TV kit SKUs", sev: "low" }
      ],
      intel: [
        { date: "2026-09-24", text: "Adam, Ryan, Ben and Hal proposed what Assembly can take on: plug-and-play FOH racks, selective rack whips, accessory and manual packs, ladder tray. Tyson: “This all sounds fantastic.”", slack: "p1790279093011569" },
        { date: "2026-09-22", text: "[[Flatirons]] picked to pilot area-based re-inventory and palletization. Assembly label already prints area.", src: "0922" },
        { date: "2026-09-22", text: "TV kit contents defined; Rachel made Summit-branded stickers so kits ship as a finished product.", src: "0922" },
        { date: "2026-09-15", text: "TV mounting kit spec posted. Kits built in the warehouse and pulled per project; Ben creating its Summit ID.", slack: "p1789494797214059" },
        { date: "2026-09-08", text: "Pre-labeled lighting saved a full day on [[WWK]]. Staging by package (PA / video / lighting / FOH) adopted as the interim step.", src: "0908" }
      ]
    },
    {
      id: "BO-003",
      codename: "ADVANCE PARTY",
      title: "Pre-Install Prep",
      pillar: "Install",
      status: "active",
      clearance: "CONFIDENTIAL",
      lead: "Ryan Lynette",
      team: ["Ryan Lynette", "Ben Blevins", "Ben Thompson", "Levi Connell"],
      start: "2026-08-04",
      end: "2027-01-31",
      estimatedEnd: true,
      impact: 8,
      effort: 6,
      vision:
        "When the crew arrives, points are rigged, locations are laid out and every decision is already made.",
      mission:
        "A 3–4 week prep window once a project hits go: foreman visits during assembly, pre-rigging, layout of TV, sight-line and camera locations, and pre-commissioning. Small scoped teams handle wire pulls, terminations or rigging ahead of the main trip. One live site-survey checklist follows the job from first sales contact to install.",
      objectives: [
        { text: "Adopt Flight Plan as the single source for schedules, travel and flights", done: true, owner: "Ryan", step: "simplify" },
        { text: "Open ~10 nationwide electrical supply accounts for foremen", done: true, owner: "Ben T.", step: "delete" },
        { text: "Add all foremen to Amazon Business", done: true, owner: "Tyson", step: "simplify" },
        { text: "Switch rigging to pre-made 1/4\" wire-rope slings (2 ft / 3 ft)", done: true, owner: "Ben T.", step: "delete" },
        { text: "Scope a narrow pre-wire trip for [[Evangel Temple]]", done: false, owner: "Ryan", step: "accelerate" },
        { text: "Install ladder tray at the start of the wire-pull trip, sized from rack-count packages", done: false, owner: "Adam", step: "simplify" },
        { text: "Pick a pilot for the 3–4 week prep model and set success metrics", done: false, owner: "Ryan", step: "accelerate" },
        { text: "End-to-end site-survey and verification checklist", done: false, owner: "Ryan & Ben B.", step: "simplify" },
        { text: "Assess AR / Matterport for digital layout", done: false, owner: "Ben B.", step: "question" }
      ],
      outcomes: [
        { label: "Scheduling", value: "Flight Plan", detail: "One place for team schedules, travel days and flights. Called a big win on 09/22.", state: "met" },
        { label: "Field purchasing", value: "~10 vendors", detail: "Foremen buy strut and all-thread on account instead of shipping or Fastenal.", state: "met" },
        { label: "On-site install duration", value: "2 wk → 1 wk", detail: "Goal of the prep-window pilot.", state: "pending" }
      ],
      phases: [
        { name: "Enablers", start: "2026-08-04", end: "2026-09-30" },
        { name: "Pre-trip pilot", start: "2026-10-01", end: "2026-11-30" },
        { name: "Prep window", start: "2026-12-01", end: "2027-01-31" }
      ],
      risks: [
        { text: "Locking crews into a prep window reduces scheduling flexibility", sev: "med" },
        { text: "Hard to free up a pilot project around current commitments", sev: "med" },
        { text: "AR measurement accuracy unproven", sev: "low" }
      ],
      intel: [
        { date: "2026-09-24", text: "Proposal: ladder tray goes in at the start of the wire-pull trip, with standard packages by rack count and engineer-drawn layouts.", slack: "p1790279093011569" },
        { date: "2026-09-22", text: "Flight Plan adopted as the source of truth for install scheduling. [[Evangel Temple]] lined up for a 2–3 person pre-wire trip.", src: "0922" },
        { date: "2026-09-08", text: "Pre-made wire-rope slings replace cut chain; aircraft cable and swaging being phased out. Supply accounts opened.", src: "0908" },
        { date: "2026-08-11", text: "Vertical alignment model proposed: 3–4 week prep window to finish installs in one week instead of two.", src: "0811" }
      ]
    },
    {
      id: "BO-004",
      codename: "TOPO",
      title: "Topo Design Model",
      pillar: "Engineering",
      status: "active",
      clearance: "TOP SECRET",
      lead: "Travis Leatherman",
      team: ["Travis Leatherman", "Cameron Fries", "Tyson Wiens"],
      start: "2026-08-04",
      end: "2027-02-26",
      estimatedEnd: true,
      impact: 10,
      effort: 9,
      vision:
        "One live design model per project that draws the schematics, prints the labels and talks to Apex both ways.",
      mission:
        "A browser-based tool that replaces ConnectCAD and Vectorworks for ID schematics: schematics without sheet limits, rack elevations, plates and cut sheets, patch bay labels, pull sheets and schedules, and drawing-set revisions. A priced parts list from Apex becomes a drawing, and the link back to Apex catches what was actually ordered. v1 is the point Topo replaces ConnectCAD; field apps come after the browser is proven.",
      objectives: [
        { text: "Browser prototype previewed to the team", done: true, owner: "Travis", step: "question" },
        { text: "Skeleton shown to engineers for feedback", done: true, owner: "Travis", step: "question" },
        { text: "Import 1,425 blocks from ConnectCAD", done: true, owner: "Travis", step: "delete" },
        { text: "Patch bay labels derived from the wiring", done: true, owner: "Travis", step: "automate" },
        { text: "Plans, DXF and drawing-set revisions (90%)", done: false, owner: "Travis", step: "simplify" },
        { text: "Plates and cut sheets (90%)", done: false, owner: "Travis", step: "simplify" },
        { text: "Parts list to drawing, with the Apex link and room matching (73%)", done: false, owner: "Travis", step: "automate" },
        { text: "Two read-only fields on the Apex project lines endpoint for Topo", done: false, owner: "Tyson", step: "automate" },
        { text: "Schedules: pull sheet, gear list, IP schedule, client-facing PDER (53%)", done: false, owner: "Travis", step: "automate" },
        { text: "Schematic ready to issue (51%)", done: false, owner: "Travis", step: "simplify" },
        { text: "Platform: shared model store, live multi-user edits (41%)", done: false, owner: "Travis", step: "accelerate" },
        { text: "Release: draw one real job end to end, train the engineers, installer works from a Topo set", done: false, owner: "Travis", step: "accelerate" },
        { text: "iOS and Android field apps, after the browser is proven", done: false, owner: "Travis", step: "accelerate" }
      ],
      outcomes: [
        { label: "Progress to v1", value: "60%", detail: "362 of 601 planned hours done; 441 of 527 items closed.", state: "on" },
        { label: "Time left to v1", value: "240 h", detail: "About 6 working weeks, which puts v1 around early November.", state: "on" },
        { label: "ConnectCAD blocks imported", value: "1,425", detail: "The existing symbol library carried into Topo.", state: "met" },
        { label: "Tools retired", value: "ConnectCAD", detail: "v1 is defined as the point Topo replaces it for ID schematics.", state: "pending" }
      ],
      plan: {
        title: "Road to v1",
        source: "Topo Release Plan, as of about 25 Sep 2026",
        stats: [
          { v: "240 h", l: "Left to v1" },
          { v: "6.0 wk", l: "Working weeks" },
          { v: "60%", l: "Done by hours" },
          { v: "441/527", l: "Items done" },
          { v: "38", l: "Ready for review · 117 h" },
          { v: "11", l: "Blocked on someone" }
        ],
        streams: [
          { name: "Platform spine", left: 66, total: 112, note: "Access, failure handling, hosting, live model store" },
          { name: "Schematic", left: 34, total: 69, note: "What an issued sheet needs, plus polish" },
          { name: "Parts and Apex", left: 30, total: 112, note: "Priced list to drawing, link back to Apex" },
          { name: "Schedules", left: 30, total: 65, note: "Pull sheet, gear list, IP schedule, conduits, PDER" },
          { name: "Blocks and library", left: 26, total: 45, note: "1,425 blocks imported from ConnectCAD" },
          { name: "Release", left: 22, total: 23, note: "Real job, training, issue a set, installer on site" },
          { name: "Racks", left: 18, total: 32, note: "Drawn, editable, grouped by room" },
          { name: "Plans and DXF", left: 7, total: 69, note: "CD sets, linework, drawing-set revisions" },
          { name: "Plates", left: 6, total: 58, note: "Includes the cut sheets" },
          { name: "Patchbay labels", left: 0, total: 16, note: "Derived from the wiring" },
          { name: "iOS / Android / Mac apps", left: 3, total: 3, note: "Scoping only for v1; builds come later" }
        ],
        parked: "54 h parked past v1 (8 h of it conditional): print at sheet size, title blocks and revision clouds, Google SSO and roles, client read-only access, offline field mode, security review."
      },
      phases: [
        { name: "Prototype", start: "2026-08-04", end: "2026-09-07" },
        { name: "Build to v1", start: "2026-09-08", end: "2026-11-06" },
        { name: "Field apps", start: "2026-11-09", end: "2027-02-26" }
      ],
      risks: [
        { text: "11 items blocked, most waiting on decisions, exports or reviews from Travis", sev: "high" },
        { text: "38 items (117 h) finished and waiting for review", sev: "med" },
        { text: "Others are building browser system maps too (MxU teased one on 09/24)", sev: "med" },
        { text: "Routing a full model on a large job takes about 5 minutes; cold starts were most of the slowness", sev: "med" },
        { text: "The release work (training, a real job, field use) is where tools fail; 22 of its 23 hours are still ahead", sev: "med" }
      ],
      intel: [
        { date: "2026-09-25", text: "Release plan: 240 h left to v1, about 6 working weeks. 60% done by hours, 441 of 527 items closed, 11 blocked.", doc: "Topo Release Plan" },
        { date: "2026-09-24", text: "Tyson flagged MxU teasing browser-based system maps for churches: “Everyone is doing it.”", slack: "p1790274137085339" },
        { date: "2026-09-22", text: "Area comes from estimates; Topo will backfill room-level location later.", src: "0922" },
        { date: "2026-09-21", text: "The Apex link shows what was actually ordered: four devices on [[Flatirons]] were drawn for gear nobody bought.", doc: "Topo Release Plan" },
        { date: "2026-09-21", text: "Every box on all five junction box schedules now reaches a row (30 of 417 tags didn't before). The client-facing PDER page is built.", doc: "Topo Release Plan" },
        { date: "2026-09-08", text: "Skeleton presented to engineers with strong feedback. Next: import wizard and data cleanliness.", src: "0908" },
        { date: "2026-08-11", text: "Sneak preview: schematics, rack elevations, patch labels and pull sheets in the browser.", src: "0811" }
      ]
    },
    {
      id: "BO-005",
      codename: "APEX",
      title: "Apex Estimating",
      pillar: "Sales",
      status: "live",
      ongoing: true,
      clearance: "SECRET",
      lead: "Cameron Fries",
      team: ["Cameron Fries", "Tyson Wiens", "Jacob Cody"],
      start: "2026-08-04",
      end: "2027-02-26",
      impact: 9,
      effort: 6,
      vision:
        "Two clicks get an estimate 90% of the way, and everything downstream (orders, labels, kits) falls out of it.",
      mission:
        "Apex is live and is how we estimate today. The work now is continuous refinement: standard packages (tour-grade, distributed, visionary) grouped by room, areas captured at estimate time, speaker cabling option sets for fast quotes, TV accessories that add themselves, and more of the paperwork moved out of PandaDoc.",
      objectives: [
        { text: "Apex rolled out as the estimating platform", done: true, owner: "Tyson", step: "simplify" },
        { text: "Move contracts and change orders from PandaDoc into Apex", done: true, owner: "Tyson", step: "delete" },
        { text: "Editable Area column in estimates, auto-filled from system name", done: true, owner: "Tyson", step: "automate" },
        { text: "Black Ops template: lighting (about half done)", done: false, owner: "Cameron", step: "simplify" },
        { text: "Black Ops template: distributed", done: false, owner: "Cameron", step: "simplify" },
        { text: "Review ~12 pricing and efficiency items", done: false, owner: "Cameron & Tyson", step: "question" },
        { text: "Speaker cabling option sets (SC32/SoCo to KCON, NL8 to NL4) with cost comparison", done: false, owner: "Team", step: "simplify" },
        { text: "Auto-add TV accessories when a TV is added", done: false, owner: "Cameron", step: "automate" },
        { text: "SA review: reviewed by default, explicit “wait” for exceptions", done: false, owner: "Tyson", step: "question" },
        { text: "Per-unit serials, area and location on every order sheet line", done: true, owner: "Tyson", step: "simplify" },
        { text: "Find in Projects: search any part across current and past projects", done: true, owner: "Tyson", step: "simplify" },
        { text: "Slack DMs when you're mentioned in Apex", done: true, owner: "Tyson", step: "automate" },
        { text: "Move the master parts list into Apex and retire the Google sheet", done: false, owner: "Tyson", step: "delete" },
        { text: "Auto-generated reports for final project meetings", done: false, owner: "Tyson", step: "automate" }
      ],
      outcomes: [
        { label: "Estimating platform", value: "Live", detail: "Apex is rolled out and in daily use; refinements ship continuously.", state: "met" },
        { label: "Contract paperwork", value: "Off PandaDoc", detail: "Contracts and change orders fully in Apex; proposals stay in PandaDoc for now.", state: "met" },
        { label: "Black Ops template", value: "~50%", detail: "Lighting halfway, distributed still to go. Wrap targeted this week.", state: "on" },
        { label: "Estimating speed", value: "2 clicks → 90%", detail: "Room packages make a multi-room estimate mostly automatic.", state: "pending" },
        { label: "Release cadence", value: "11 in 9 wks", detail: "Updates announced in #apex between 22 Jul and 24 Sep.", state: "met" }
      ],
      feedback: {
        since: "2026-07-22",
        until: "2026-09-24",
        shipped: [
          { date: "2026-09-23", text: "Pick and order the cards on your home dashboard", slack: "p1790173585388799" },
          { date: "2026-09-18", text: "Create pricing straight from a lead card", slack: "p1789741581312089" },
          { date: "2026-09-16", text: "“Just Signed” celebration when a contract comes back", slack: "p1789581035322089" },
          { date: "2026-09-14", text: "Slack DM when you're mentioned in Apex", slack: "p1789389624001999" },
          { date: "2026-09-09", text: "Find in Projects: search a part across all projects", slack: "p1788961755842049" },
          { date: "2026-09-02", text: "Order sheets: per-unit quantities, serials, area and location, partial deliveries", slack: "p1788380800147599" },
          { date: "2026-09-02", text: "Vendor quotes stored with the project", slack: "p1788377233253059" },
          { date: "2026-08-12", text: "Home dashboards for sales, SEs and PMs", slack: "p1786581340426409" },
          { date: "2026-07-29", text: "Internal comments and client-portal comments split", slack: "p1785380082856639" },
          { date: "2026-07-29", text: "Restock fees on items removed by change order", slack: "p1785370391730419" },
          { date: "2026-07-28", text: "Paste text from an email and match items into an estimate", slack: "p1785266259636639" }
        ],
        // kind: feature | bug | access (permissions, accounts, imports, how-to)
        asks: [
          { date: "2026-09-24", who: "Matthew Kinney", theme: "Client portal", kind: "feature", text: "Viewer role on the client side for support", slack: "p1790288747127679" },
          { date: "2026-09-24", who: "Chase McCall", theme: "Leads & reporting", kind: "feature", text: "One place to fix a lead's address; bad addresses are raising freight costs", slack: "p1790287266557059" },
          { date: "2026-09-24", who: "John Clark", theme: "Contracts & change orders", kind: "bug", text: "Contract emails greet the church's name, not the client's (“Hi Plum,”)", slack: "p1790284288222749" },
          { date: "2026-09-24", who: "Anthony Ray", theme: "Parts lists & pricing", kind: "feature", text: "Bring back the expanded travel view from the Google parts list", slack: "p1790283515532639" },
          { date: "2026-09-23", who: "Nick Vidaurri", theme: "Access & admin", kind: "access", text: "Recover a deleted box-sale estimate", slack: "p1790194830067759" },
          { date: "2026-09-23", who: "Seth Thiesen", theme: "Parts lists & pricing", kind: "bug", text: "Error re-importing an updated vendor quote", slack: "p1790193356706619" },
          { date: "2026-09-23", who: "Michael Hopkins", theme: "Order sheets & warehouse", kind: "feature", text: "Filter Drawing QTY (including blanks) in the engineer view", slack: "p1790180560531089" },
          { date: "2026-09-22", who: "David Forman", theme: "Contracts & change orders", kind: "feature", text: "Fill Exhibit D from the drawings' division of work", slack: "p1790091784891519" },
          { date: "2026-09-22", who: "Daniel Cronk", theme: "Access & admin", kind: "access", text: "Can't edit serial and MAC fields", slack: "p1790090502308149" },
          { date: "2026-09-21", who: "David Forman", theme: "Client portal", kind: "feature", text: "Shared password vault the church can see in the portal", slack: "p1790024753163339" },
          { date: "2026-09-21", who: "Justin Hitch", theme: "Parts lists & pricing", kind: "feature", text: "Draft a parts list before a lead number exists, link it later", slack: "p1790014443809769" },
          { date: "2026-09-21", who: "Jacob Cody", theme: "Leads & reporting", kind: "feature", text: "Merge duplicate client records", slack: "p1790012017435649" },
          { date: "2026-09-21", who: "Derek Milton", theme: "Notifications & comments", kind: "feature", text: "Resolve comments but keep their history", slack: "p1790002891350269" },
          { date: "2026-09-18", who: "Anthony Ray", theme: "Client portal", kind: "feature", text: "Export the timeline view as a PDF for clients and GCs", slack: "p1789756358549329" },
          { date: "2026-09-18", who: "Jacob Cody", theme: "Leads & reporting", kind: "feature", text: "Custom views across all sales pipelines", slack: "p1789745227358399" },
          { date: "2026-09-18", who: "Jacob Cody", theme: "Notifications & comments", kind: "feature", text: "Slack alert when a contract is approved and ready to send", slack: "p1789742870106649" },
          { date: "2026-09-18", who: "Seth Thiesen", theme: "Parts lists & pricing", kind: "access", text: "How to start a new pricing doc", slack: "p1789740048784559", answered: "2026-09-18" },
          { date: "2026-09-17", who: "Cameron Fries", theme: "Parts lists & pricing", kind: "feature", text: "Client View custom items at final price, markup hidden", slack: "p1789660615599399" },
          { date: "2026-09-16", who: "Jacob Cody", theme: "Client portal", kind: "feature", text: "Let clients see archived projects", slack: "p1789592468484429" },
          { date: "2026-09-16", who: "Cameron Fries", theme: "Performance & mobile", kind: "bug", text: "Chrome struggling to load projects and capacity", slack: "p1789575374038669" },
          { date: "2026-09-15", who: "Cameron Fries", theme: "Contracts & change orders", kind: "feature", text: "Drag to reorder contract exhibits", slack: "p1789514320075049" },
          { date: "2026-09-15", who: "Derek Milton", theme: "Parts lists & pricing", kind: "bug", text: "Reordered rows don't stick; bold part numbers disappear", slack: "p1789502640103679" },
          { date: "2026-09-15", who: "Ryan Lynette", theme: "Access & admin", kind: "access", text: "Warehouse and install teams need to edit Pack Status", slack: "p1789501207961659" },
          { date: "2026-09-14", who: "Cameron Fries", theme: "Parts lists & pricing", kind: "access", text: "Where to unlock a pricing doc", slack: "p1789425218667489" },
          { date: "2026-09-11", who: "Cameron Fries", theme: "Parts lists & pricing", kind: "bug", text: "Toggling the base system shifts the total by about $1,000", slack: "p1789140902191469" },
          { date: "2026-09-11", who: "Ben Thompson", theme: "Performance & mobile", kind: "bug", text: "QR code problem in mobile Apex", slack: "p1789135179569849" },
          { date: "2026-09-11", who: "Jeremy McKee", theme: "Parts lists & pricing", kind: "bug", text: "Scope notes shared across add-alts", slack: "p1789133773077769" },
          { date: "2026-09-09", who: "Matthew Kinney", theme: "Notifications & comments", kind: "feature", text: "Clicking a mention should open the item", slack: "p1788977360627599" },
          { date: "2026-09-09", who: "Jeremy McKee", theme: "Notifications & comments", kind: "feature", text: "Send Apex mentions to Slack or email", slack: "p1788975292294959", answered: "2026-09-14" },
          { date: "2026-09-08", who: "Matthew Kinney", theme: "Performance & mobile", kind: "bug", text: "iPhone keyboard hides the comment box", slack: "p1788903824545349" },
          { date: "2026-09-08", who: "Marcelo Cacciagioni", theme: "Access & admin", kind: "access", text: "Needs estimating access", slack: "p1788895612366449" },
          { date: "2026-09-04", who: "Cameron Fries", theme: "Client portal", kind: "feature", text: "Let a client mark items OFE on the master template", slack: "p1788555104906089" },
          { date: "2026-09-03", who: "Ben Thompson", theme: "Order sheets & warehouse", kind: "feature", text: "“Left to pack” filter should include Staged and Palletize", slack: "p1788467298934789" },
          { date: "2026-09-03", who: "Jeremy McKee", theme: "Parts lists & pricing", kind: "feature", text: "Search current and past projects for a part", slack: "p1788442840788249", answered: "2026-09-09" },
          { date: "2026-09-03", who: "Derek Milton", theme: "Parts lists & pricing", kind: "feature", text: "Drag handle on the left for labels and spacers", slack: "p1788438670631899" },
          { date: "2026-09-02", who: "Jeremy McKee", theme: "Parts lists & pricing", kind: "feature", text: "Bigger grand total at the top of Client View", slack: "p1788356381571889" },
          { date: "2026-08-31", who: "Matt Strong", theme: "Order sheets & warehouse", kind: "bug", text: "Can't mark a quoted PDW Ready to Order", slack: "p1788219566080549" },
          { date: "2026-08-31", who: "Justin Hitch", theme: "Access & admin", kind: "access", text: "Import a Google parts list", slack: "p1788191420442979" },
          { date: "2026-08-31", who: "Ryan Lynette", theme: "Order sheets & warehouse", kind: "feature", text: "Capture serials and MACs at warehouse check-in", slack: "p1788186373634989", answered: "2026-09-02" },
          { date: "2026-08-26", who: "Cameron Fries", theme: "Parts lists & pricing", kind: "feature", text: "Move several rows at once", slack: "p1787779944497269" },
          { date: "2026-08-26", who: "Anthony Ray", theme: "Contracts & change orders", kind: "feature", text: "Change signers on a change order after it's sent", slack: "p1787775987645899" },
          { date: "2026-08-26", who: "Preston", theme: "Order sheets & warehouse", kind: "bug", text: "Box-sale requests missing from the warehouse request tool", slack: "p1787770511041509" },
          { date: "2026-08-25", who: "Daniel Cronk", theme: "Order sheets & warehouse", kind: "bug", text: "Parts-list items missing from the [[Flatirons]] order sheet", slack: "p1787697685128769" },
          { date: "2026-08-25", who: "Derek Milton", theme: "Contracts & change orders", kind: "feature", text: "Format change orders on a locked project", slack: "p1787668855153789" },
          { date: "2026-08-24", who: "Jeremy McKee", theme: "Notifications & comments", kind: "bug", text: "Dark-mode popups unreadable; mentions should open the item", slack: "p1787595625219359" },
          { date: "2026-08-24", who: "Ryan Lynette", theme: "Access & admin", kind: "access", text: "Accounts for three new team members", slack: "p1787589620534889" },
          { date: "2026-08-21", who: "Matthew Kinney", theme: "Order sheets & warehouse", kind: "feature", text: "Separate shipping address on order sheets", slack: "p1787346623348159" },
          { date: "2026-08-21", who: "Travis Leatherman", theme: "Performance & mobile", kind: "bug", text: "Project 5109 proposal won't load in any browser", slack: "p1787344357102999" },
          { date: "2026-08-20", who: "Justin Hitch", theme: "Access & admin", kind: "access", text: "Import a parts list into a blank project", slack: "p1787261359952759" },
          { date: "2026-08-20", who: "Seth Thiesen", theme: "Contracts & change orders", kind: "access", text: "Why some change orders can be reviewed on their own", slack: "p1787261174841889" },
          { date: "2026-08-19", who: "Ben Blevins", theme: "Contracts & change orders", kind: "feature", text: "PMs edit Exhibit C text and milestones per project", slack: "p1787172467376409" },
          { date: "2026-08-19", who: "Chase Donald", theme: "Access & admin", kind: "access", text: "Can't build a change order (permissions)", slack: "p1787168027726659" },
          { date: "2026-08-18", who: "Nick Vidaurri", theme: "Parts lists & pricing", kind: "bug", text: "Submitted project missing from Pricing Projects", slack: "p1787078212486519" },
          { date: "2026-08-18", who: "Preston", theme: "Order sheets & warehouse", kind: "bug", text: "Error marking an inventory pull", slack: "p1787070149516579" },
          { date: "2026-08-18", who: "Chase McCall", theme: "Leads & reporting", kind: "access", text: "Where the 30-day revenue tracker went", slack: "p1787067248987049" },
          { date: "2026-08-18", who: "Matt Strong", theme: "Access & admin", kind: "access", text: "Re-sync item notes from the Google sheet", slack: "p1787059888654339" },
          { date: "2026-08-17", who: "Justin Hitch", theme: "Access & admin", kind: "access", text: "Merge a duplicate parts list back into the original", slack: "p1787003689745549" },
          { date: "2026-08-17", who: "Andrew Starke", theme: "Parts lists & pricing", kind: "bug", text: "Dealer cost pulled from the list-price record", slack: "p1787003494459439" },
          { date: "2026-08-17", who: "Andrew Starke", theme: "Contracts & change orders", kind: "bug", text: "Subtotal pricing prints the same as detailed on a change order", slack: "p1786989296551819" },
          { date: "2026-08-14", who: "Anthony Ray", theme: "Order sheets & warehouse", kind: "bug", text: "Email thread button missing on POs", slack: "p1786715454220449" },
          { date: "2026-08-13", who: "Matthew Kinney", theme: "Access & admin", kind: "access", text: "Foreman permissions for on-site check-in", slack: "p1786654493631759" },
          { date: "2026-08-12", who: "Ben Blevins", theme: "Access & admin", kind: "access", text: "PMs need to build and submit change orders", slack: "p1786559251234539" },
          { date: "2026-08-12", who: "Anthony Ray", theme: "Contracts & change orders", kind: "feature", text: "Pull Exhibit C milestones from the contract", slack: "p1786554725347629" },
          { date: "2026-08-12", who: "Anthony Ray", theme: "Access & admin", kind: "access", text: "PMs need to mark product delivered", slack: "p1786551343603619" },
          { date: "2026-08-10", who: "Andrew Starke", theme: "Integrations", kind: "feature", text: "Build the Google Drive folders when pricing is created", slack: "p1786383062667389" },
          { date: "2026-08-07", who: "Derek Milton", theme: "Parts lists & pricing", kind: "bug", text: "Importing a quote at quote price throws a price error", slack: "p1786123020271319" },
          { date: "2026-08-07", who: "Ben Blevins", theme: "Access & admin", kind: "access", text: "Director role can't change order sheet statuses", slack: "p1786123018801469" },
          { date: "2026-08-07", who: "Lex Bond", theme: "Order sheets & warehouse", kind: "bug", text: "Apex not suggesting stock we already have", slack: "p1786119428106319" },
          { date: "2026-08-06", who: "Ryan Lynette", theme: "Leads & reporting", kind: "bug", text: "Project financials missing hours and travel costs", slack: "p1786025352836719" },
          { date: "2026-08-04", who: "Derek Milton", theme: "Access & admin", kind: "access", text: "Import a parts list for project 5148", slack: "p1785876775886879" },
          { date: "2026-08-04", who: "Ben Thompson", theme: "Performance & mobile", kind: "bug", text: "Mobile slow; some order sheets won't load", slack: "p1785864836256179" },
          { date: "2026-07-31", who: "Seth Thiesen", theme: "Access & admin", kind: "access", text: "Unlock a project for client changes", slack: "p1785510833828389" },
          { date: "2026-07-30", who: "Ben Thompson", theme: "Order sheets & warehouse", kind: "feature", text: "Assembly mark on package labels", slack: "p1785428892886239" },
          { date: "2026-07-29", who: "Nick Vidaurri", theme: "Performance & mobile", kind: "bug", text: "Apex stuck in read-only for an hour", slack: "p1785356053580489" },
          { date: "2026-07-28", who: "Ryan Lynette", theme: "Order sheets & warehouse", kind: "feature", text: "Undo and edit history on order sheet status", slack: "p1785265335145539" },
          { date: "2026-07-22", who: "Ben Blevins", theme: "Access & admin", kind: "access", text: "Can't change order sheet statuses", slack: "p1784757656025489" },
          { date: "2026-07-22", who: "Lex Bond", theme: "Integrations", kind: "feature", text: "Push database pricing into Sage", slack: "p1784748339328509" },
          { date: "2026-07-22", who: "Cameron Fries", theme: "Order sheets & warehouse", kind: "feature", text: "Order sheet view in contracted parts-list order", slack: "p1784731268788889" }
        ]
      },
      phases: [
        { name: "Live · continuous refinement", start: "2026-08-04", end: "2027-02-26", ongoing: true }
      ],
      risks: [
        { text: "Nearly every request in #apex is addressed to one person (Tyson); 78 asks in 9 weeks", sev: "high" },
        { text: "Permissions, accounts and imports keep blocking people: 21 of the 78 asks", sev: "med" },
        { text: "Lead records with wrong addresses and websites are raising freight costs", sev: "med" },
        { text: "SE details lost in free-text notes instead of structured fields", sev: "med" },
        { text: "Breakout choices change amplifier channel use and layouts", sev: "med" },
        { text: "Go-to 15\" box has no splay option in its tour version", sev: "low" }
      ],
      intel: [
        { date: "2026-09-23", text: "Shipped: pick and order the cards on your home dashboard.", slack: "p1790173585388799", ch: "apex" },
        { date: "2026-09-22", text: "Area vs. location model confirmed. SEs can override area in a hidden estimate column.", src: "0922" },
        { date: "2026-09-14", text: "Shipped: Slack DMs when you're mentioned, five days after Jeremy asked for it.", slack: "p1789389624001999", ch: "apex" },
        { date: "2026-09-09", text: "Shipped: Find in Projects, search any part across every project. Answered Jeremy's 3 Sep request.", slack: "p1788961755842049", ch: "apex" },
        { date: "2026-09-08", text: "Jacob shared the Lex 19-pin connector used for speaker wire as a reference for the cabling option sets.", slack: "p1788887964308529" },
        { date: "2026-09-08", text: "Speaker cabling standardization prioritized; NL4 jumpers to be stocked at a standard length.", src: "0908" },
        { date: "2026-08-11", text: "Contracts and change orders moved from PandaDoc into Apex. V2 pricing template started.", src: "0811" }
      ]
    },
    {
      id: "BO-006",
      codename: "SIGNAL FLARE",
      title: "Apex Marketing",
      pillar: "Sales",
      status: "extraction",
      clearance: "CONFIDENTIAL",
      lead: "Tyson Wiens",
      team: ["Tyson Wiens", "Jacob Cody"],
      start: "2026-08-04",
      end: "2026-10-31",
      estimatedEnd: true,
      impact: 6,
      effort: 3,
      vision:
        "Leads, email marketing and client history live in Apex, and Nutshell goes away for good.",
      mission:
        "Finish the move off Nutshell: lead management in Apex (done), email marketing rebuilt in Apex with Rachel, and AI meeting summaries landing as concise, consistent CRM notes. Proposals get a visual refresh built on the sales bible and StoryBrand.",
      objectives: [
        { text: "Custom Apex CRM that mirrors Nutshell", done: true, owner: "Tyson", step: "simplify" },
        { text: "Lead management moved into Apex", done: true, owner: "Tyson", step: "delete" },
        { text: "Email marketing build with Rachel", done: false, owner: "Tyson", due: "2026-09-24", step: "simplify" },
        { text: "Retire Nutshell", done: false, owner: "Tyson", step: "delete" },
        { text: "Standard AI discovery and programming summaries in CRM notes", done: false, owner: "Jacob", step: "automate" },
        { text: "Capture room and area names in programming-meeting prompts", done: false, owner: "Jacob", step: "automate" }
      ],
      outcomes: [
        { label: "Tool savings", value: "$15K / yr", detail: "From deleting Nutshell and simplifying the tool set.", state: "on" },
        { label: "Lead management", value: "In Apex", detail: "Nutshell no longer needed for CRM.", state: "met" },
        { label: "Email marketing", value: "In build", detail: "Base platform built in Apex; working session with Rachel on 09/24.", state: "on" }
      ],
      phases: [
        { name: "CRM build", start: "2026-08-04", end: "2026-08-31" },
        { name: "Lead cutover", start: "2026-09-01", end: "2026-09-21" },
        { name: "Email & retire", start: "2026-09-22", end: "2026-10-31" }
      ],
      risks: [
        { text: "Nutshell can't be retired until email marketing is fully rebuilt", sev: "med" },
        { text: "Cutover date has slipped once", sev: "low" }
      ],
      intel: [
        { date: "2026-09-22", text: "Lead management moved into Apex. Email marketing build continues with Rachel; ~$15K/yr savings expected.", src: "0922" },
        { date: "2026-08-11", text: "Apex CRM fully mirrors Nutshell; cutover planned with Nathan and Jake.", src: "0811" }
      ]
    },
    {
      id: "BO-007",
      codename: "GHOST WRITER",
      title: "AI & Admin Automation",
      pillar: "Operations",
      status: "active",
      clearance: "TOP SECRET",
      lead: "Tyson Wiens",
      team: ["Tyson Wiens", "Jacob Cody", "Adam Hoekstra"],
      start: "2026-08-04",
      end: "2026-12-31",
      estimatedEnd: true,
      impact: 8,
      effort: 4,
      vision:
        "Machines do the checking, drafting and chasing, and people only review what's actually unusual.",
      mission:
        "AI agents and automations across finance, admin and sales: nightly bill verification, AI-drafted first overdue-invoice emails from Sage, Ramp auto-approval for clean expenses, and assistants that book travel, schedule meetings, prep briefs and track commitments.",
      objectives: [
        { text: "Nightly bill verification on amount and date", done: true, owner: "Tyson", step: "automate" },
        { text: "AI drafts first overdue-invoice email from Sage, human sends", done: true, owner: "Tyson", step: "automate" },
        { text: "Ramp auto-approves compliant expenses under $150", done: true, owner: "Tyson", step: "automate" },
        { text: "Ramp down to memo and project as the only user inputs", done: false, owner: "Tyson", step: "delete" },
        { text: "Roll out AI assistants to AM / PM / SE roles", done: false, owner: "Jacob", step: "automate" },
        { text: "Enterprise Claude access for Adam", done: false, owner: "Tyson", step: "accelerate" }
      ],
      outcomes: [
        { label: "AR outreach time", value: "−4 h / wk", detail: "First overdue-invoice drafts built automatically; replaces Carrie's manual work.", state: "met" },
        { label: "Bills verified nightly", value: "500–600 / mo", detail: "Every bill entry checked on amount and date.", state: "met" },
        { label: "Account manager workload", value: "~85% automated", detail: "Jacob's proof of concept: travel, expenses, scheduling, briefs, digests.", state: "on" }
      ],
      phases: [
        { name: "Finance bots", start: "2026-08-04", end: "2026-09-21" },
        { name: "Expense rules", start: "2026-09-22", end: "2026-10-31" },
        { name: "Team rollout", start: "2026-11-01", end: "2026-12-31" }
      ],
      risks: [
        { text: "Per-seat AI cost at scale; rolling out in phases", sev: "med" },
        { text: "Ongoing AR threads still need a person", sev: "low" }
      ],
      intel: [
        { date: "2026-09-22", text: "AI AR emails and nightly bill checks live. Ramp auto-approves clean expenses under $150.", src: "0922" },
        { date: "2026-09-08", text: "Nightly bill review tool built for 500–600 bills a month. Jacob reports ~85% of his work automated.", src: "0908" }
      ]
    }
  ]
};
