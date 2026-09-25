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
 * status:     "recon" | "active" | "extraction" | "complete" | "hold"
 * impact / effort: 1–10 (drives the Radar view)
 * objectives: { text, done, owner?, due? }
 * outcomes:   { label, value, detail, state: "met" | "on" | "pending" | "behind" }
 * intel:      { date, text, src?, slack? }
 *             src = key into MEETINGS; slack = message id (p + ts without the dot)
 */
window.BLACKOPS = {
  unit: "Summit Black Ops",
  mandate: "Delete steps. Simplify steps. Then accelerate and automate, across sales, engineering, warehouse and install.",
  asOf: "2026-09-25",

  CHANNEL: {
    name: "#project_black_ops",
    url: "https://summitrocks.slack.com/archives/C0BTG1DMRRN",
    summary: "Day-to-day thread for the team: prototypes, kit specs, assembly proposals and things worth copying."
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
        { text: "Define networked breakout architecture (RJ45 → DB25 → XLR, terminal-block RIO option)", done: true, owner: "Adam" },
        { text: "V1 / V2 CAT-to-multipin and CAT-to-XLR PCB prototypes, incl. W1 to 3× RJ45", done: true, owner: "Cameron" },
        { text: "Order parts and PCBs for the first audio-over-Cat tests", done: true, owner: "Travis" },
        { text: "Patent check on Catalyst (Venueflex) and similar products: nothing found", done: true, owner: "Tyson & Adam" },
        { text: "Test-fit PCB chassis connectors in plates and confirm rear mounting", done: true, owner: "Ben T." },
        { text: "Run a 150–200 ft test and validate the W1 Medusa 12-XLR breakout", done: false, owner: "Adam" },
        { text: "Research grounding, pin-1, EMI, solder and corrosion standards; write a test plan", done: false, owner: "Adam" },
        { text: "Build vs. buy standard for RJ45/DB25/XLR breakout assemblies", done: false, owner: "Adam" },
        { text: "Enclosed modular 1RU rack unit that looks like a finished product", done: false, owner: "Cameron" },
        { text: "Pilot the swap from analog to shielded Cat6 on a signed project", done: false, owner: "Cameron" }
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
        { text: "Stage pallets by package: PA, video, lighting, FOH", done: true, owner: "Levi" },
        { text: "Pre-address, pre-clamp and pre-label lighting fixtures before shipping", done: true, owner: "Levi" },
        { text: "Area prints on every warehouse label template", done: false, owner: "Tyson" },
        { text: "Re-inventory and palletize [[Flatirons]] by area", done: false, owner: "Ryan & Ben T." },
        { text: "Batch pallets by area during receiving", done: false, owner: "Ben T." },
        { text: "TV mounting kit parts list defined", done: true, owner: "Ryan" },
        { text: "Summit ID for the TV kit in the warehouse database, linked to its parts list", done: false, owner: "Ben T." },
        { text: "Quarterly build of 100–150 TV kits from stock", done: false, owner: "Adam & Ryan" },
        { text: "Wall-mounted pegboard converter board sample", done: false, owner: "Levi" },
        { text: "Monthly pre-make of custom cables for upcoming projects", done: false, owner: "Ryan" },
        { text: "Plug-and-play FOH racks: field lines land on interface plates, looms pre-sorted to stations", done: false, owner: "Adam" },
        { text: "Selective whips from main racks to nearby rooms, planned during CDs", done: false, owner: "Adam & Hal" },
        { text: "Branded accessory and manual packs; accessories bagged, labeled, in a separate-colored bin", done: false, owner: "Adam" }
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
        { text: "Adopt Flight Plan as the single source for schedules, travel and flights", done: true, owner: "Ryan" },
        { text: "Open ~10 nationwide electrical supply accounts for foremen", done: true, owner: "Ben T." },
        { text: "Add all foremen to Amazon Business", done: true, owner: "Tyson" },
        { text: "Switch rigging to pre-made 1/4\" wire-rope slings (2 ft / 3 ft)", done: true, owner: "Ben T." },
        { text: "Scope a narrow pre-wire trip for [[Evangel Temple]]", done: false, owner: "Ryan" },
        { text: "Install ladder tray at the start of the wire-pull trip, sized from rack-count packages", done: false, owner: "Adam" },
        { text: "Pick a pilot for the 3–4 week prep model and set success metrics", done: false, owner: "Ryan" },
        { text: "End-to-end site-survey and verification checklist", done: false, owner: "Ryan & Ben B." },
        { text: "Assess AR / Matterport for digital layout", done: false, owner: "Ben B." }
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
      codename: "HIGH GROUND",
      title: "Topo Design Model",
      pillar: "Engineering",
      status: "active",
      clearance: "TOP SECRET",
      lead: "Travis Leatherman",
      team: ["Travis Leatherman", "Cameron Fries", "Tyson Wiens"],
      start: "2026-08-04",
      end: "2027-03-31",
      estimatedEnd: true,
      impact: 10,
      effort: 9,
      vision:
        "One live design model per project that draws the schematics, prints the labels and talks to Apex both ways.",
      mission:
        "A browser-based tool to replace Vectorworks and ConnectCAD: schematics without sheet limits, rack elevations, patch bay labels, pull sheets from scaled plans, and redlines and as-builts as a working model. It syncs with Apex both ways and backfills room locations to order sheets and labels.",
      objectives: [
        { text: "Browser prototype previewed to the team", done: true, owner: "Travis" },
        { text: "Skeleton shown to engineers for feedback", done: true, owner: "Travis" },
        { text: "Import wizard and clean data at import", done: false, owner: "Travis" },
        { text: "Button behaviours and shortcuts from user testing", done: false, owner: "Travis" },
        { text: "Apex packages drop standard blocks and layouts", done: false, owner: "Cameron & Travis" },
        { text: "Signal-mismatch and dead-end detection", done: false, owner: "Cameron & Travis" },
        { text: "Backfill room locations to order sheets and labels", done: false, owner: "Travis" }
      ],
      outcomes: [
        { label: "Build progress", value: "~60%", detail: "From rough skeleton toward 100% through import and usability passes.", state: "on" },
        { label: "Tools retired", value: "2", detail: "Vectorworks and ConnectCAD for ID schematics.", state: "pending" },
        { label: "Apex ↔ Topo sync", value: "Two-way", detail: "Drag into a rack in Topo to populate Apex; change orders shown in the drawing.", state: "pending" }
      ],
      phases: [
        { name: "Prototype", start: "2026-08-04", end: "2026-09-30" },
        { name: "Import & UX", start: "2026-10-01", end: "2026-12-15" },
        { name: "Apex sync", start: "2026-12-16", end: "2027-03-31" }
      ],
      risks: [
        { text: "Performance is slow; rollout held until it scales", sev: "high" },
        { text: "Others are building browser system maps too (MxU teased one on 09/24)", sev: "med" },
        { text: "Messy source data at import", sev: "med" },
        { text: "Full missing-gear inference is complex; scoped to dead-end detection first", sev: "low" }
      ],
      intel: [
        { date: "2026-09-24", text: "Tyson flagged MxU teasing browser-based system maps for churches: “Everyone is doing it.”", slack: "p1790274137085339" },
        { date: "2026-09-22", text: "Area comes from estimates; Topo will backfill room-level location later.", src: "0922" },
        { date: "2026-09-08", text: "Skeleton presented to engineers with strong feedback. Next: import wizard and data cleanliness.", src: "0908" },
        { date: "2026-08-11", text: "Sneak preview: schematics, rack elevations, patch labels and pull sheets in the browser.", src: "0811" }
      ]
    },
    {
      id: "BO-005",
      codename: "PRICE POINT",
      title: "Apex Estimating",
      pillar: "Sales",
      status: "active",
      clearance: "SECRET",
      lead: "Cameron Fries",
      team: ["Cameron Fries", "Tyson Wiens", "Jacob Cody"],
      start: "2026-08-04",
      end: "2026-12-31",
      estimatedEnd: true,
      impact: 9,
      effort: 6,
      vision:
        "Two clicks get an estimate 90% of the way, and everything downstream (orders, labels, kits) falls out of it.",
      mission:
        "Standard packages in Apex (tour-grade, distributed, visionary) grouped by room, with areas captured at estimate time. Speaker cabling option sets for fast quotes, TV accessories that add themselves, and contracts and change orders handled in Apex instead of PandaDoc.",
      objectives: [
        { text: "Move contracts and change orders from PandaDoc into Apex", done: true, owner: "Tyson" },
        { text: "Editable Area column in estimates, auto-filled from system name", done: true, owner: "Tyson" },
        { text: "Black Ops template: lighting (about half done)", done: false, owner: "Cameron" },
        { text: "Black Ops template: distributed", done: false, owner: "Cameron" },
        { text: "Review ~12 pricing and efficiency items", done: false, owner: "Cameron & Tyson" },
        { text: "Speaker cabling option sets (SC32/SoCo to KCON, NL8 to NL4) with cost comparison", done: false, owner: "Team" },
        { text: "Auto-add TV accessories when a TV is added", done: false, owner: "Cameron" },
        { text: "SA review: reviewed by default, explicit “wait” for exceptions", done: false, owner: "Tyson" }
      ],
      outcomes: [
        { label: "Contract paperwork", value: "Off PandaDoc", detail: "Contracts and change orders fully in Apex; proposals stay in PandaDoc for now.", state: "met" },
        { label: "Black Ops template", value: "~50%", detail: "Lighting halfway, distributed still to go. Wrap targeted this week.", state: "on" },
        { label: "Estimating speed", value: "2 clicks → 90%", detail: "Room packages make a multi-room estimate mostly automatic.", state: "pending" }
      ],
      phases: [
        { name: "V2 template", start: "2026-08-04", end: "2026-09-30" },
        { name: "Automation", start: "2026-10-01", end: "2026-11-30" },
        { name: "Rollout", start: "2026-12-01", end: "2026-12-31" }
      ],
      risks: [
        { text: "SE details lost in free-text notes instead of structured fields", sev: "med" },
        { text: "Breakout choices change amplifier channel use and layouts", sev: "med" },
        { text: "Go-to 15\" box has no splay option in its tour version", sev: "low" }
      ],
      intel: [
        { date: "2026-09-22", text: "Area vs. location model confirmed. SEs can override area in a hidden estimate column.", src: "0922" },
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
        { text: "Custom Apex CRM that mirrors Nutshell", done: true, owner: "Tyson" },
        { text: "Lead management moved into Apex", done: true, owner: "Tyson" },
        { text: "Email marketing build with Rachel", done: false, owner: "Tyson", due: "2026-09-24" },
        { text: "Retire Nutshell", done: false, owner: "Tyson" },
        { text: "Standard AI discovery and programming summaries in CRM notes", done: false, owner: "Jacob" },
        { text: "Capture room and area names in programming-meeting prompts", done: false, owner: "Jacob" }
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
        { text: "Nightly bill verification on amount and date", done: true, owner: "Tyson" },
        { text: "AI drafts first overdue-invoice email from Sage, human sends", done: true, owner: "Tyson" },
        { text: "Ramp auto-approves compliant expenses under $150", done: true, owner: "Tyson" },
        { text: "Ramp down to memo and project as the only user inputs", done: false, owner: "Tyson" },
        { text: "Roll out AI assistants to AM / PM / SE roles", done: false, owner: "Jacob" },
        { text: "Enterprise Claude access for Adam", done: false, owner: "Tyson" }
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
