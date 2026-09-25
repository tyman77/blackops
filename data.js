/*
 * BLACK OPS: initiative data.
 * Everything on the dashboard is generated from this file.
 * Add an operation by copying one object in OPERATIONS and editing it.
 *
 * The six project names are real. Codenames, dates, metrics, teams and intel
 * below are PLACEHOLDERS to show the layout; replace them with real figures.
 *
 * Text tip: wrap words in [[double brackets]] to show them as a redaction bar
 * that reveals on hover / tap.
 *
 * status:   "recon" | "active" | "extraction" | "complete" | "hold"
 * impact / effort: 1–10 (drives the Radar view)
 * outcomes: raw numbers; `better` says which direction is good.
 */
window.BLACKOPS = {
  unit: "Summit Black Ops",
  mandate:
    "The team's special projects: the standards, tools and systems that make every install faster, cleaner and more profitable.",
  asOf: "2026-09-25",

  OPERATIONS: [
    {
      id: "BO-001",
      codename: "COPPER LINE",
      title: "Cat6 Infrastructure",
      pillar: "Field Standards",
      status: "active",
      clearance: "SECRET",
      lead: "Tyson",
      team: ["Tyson", "Field Lead", "Project Mgmt"],
      start: "2026-06-01",
      end: "2026-12-15",
      impact: 8,
      effort: 6,
      vision:
        "Every cable we pull is labeled, tested and documented the same way, on every job, by every crew.",
      mission:
        "Set one Cat6 infrastructure standard: pathway and termination specs, a labeling scheme, certification testing, and as-built documentation that hands off cleanly to service. Pilot on [[two upcoming commercial jobs]].",
      objectives: [
        { text: "Termination and pathway spec written", done: true },
        { text: "Labeling scheme and label templates", done: true },
        { text: "Certification test workflow and report format", done: false },
        { text: "As-built handoff package to service", done: false }
      ],
      outcomes: [
        { label: "Drops failing certification", unit: "%", baseline: 6, current: 3.5, target: 1, better: "down" },
        { label: "Jobs with complete as-builts", unit: "%", baseline: 35, current: 60, target: 100, better: "up" },
        { label: "Rework trips per job", unit: "", baseline: 2.2, current: 1.4, target: 0.5, better: "down" }
      ],
      phases: [
        { name: "Recon", start: "2026-06-01", end: "2026-06-30" },
        { name: "Standard", start: "2026-07-01", end: "2026-10-15" },
        { name: "Pilot", start: "2026-10-16", end: "2026-12-15" }
      ],
      risks: [
        { text: "Subcontracted crews trained to a different standard", sev: "high" },
        { text: "Tester availability during peak season", sev: "med" }
      ],
      intel: [
        { date: "2026-09-18", text: "Label templates printed and in the trucks. First job fully labeled to the new scheme." },
        { date: "2026-08-27", text: "Termination and pathway spec signed off." }
      ]
    },
    {
      id: "BO-002",
      codename: "DRY RUN",
      title: "Shop Staging",
      pillar: "Operations",
      status: "active",
      clearance: "SECRET",
      lead: "Shop Lead",
      team: ["Shop Lead", "Tyson", "Field Lead"],
      start: "2026-05-01",
      end: "2026-11-30",
      impact: 9,
      effort: 5,
      vision:
        "Systems are built, programmed and tested in the shop, so the site visit is install and go.",
      mission:
        "Stand up a staging bay where racks are built, devices are configured and systems are burned in before they ship. Every staged system leaves with a test sheet and a labeled rack. Target: [[all rack builds over 12U]].",
      objectives: [
        { text: "Staging bay built out with power and network", done: true },
        { text: "Rack build and burn-in checklist", done: true },
        { text: "Configuration backups saved before shipping", done: true },
        { text: "Staging scheduled in every project plan", done: false }
      ],
      outcomes: [
        { label: "On-site programming hours per job", unit: "h", baseline: 14, current: 6, target: 4, better: "down" },
        { label: "Devices DOA on site", unit: "%", baseline: 4, current: 1.2, target: 0.5, better: "down" },
        { label: "Racks staged before ship", unit: "%", baseline: 10, current: 65, target: 90, better: "up" }
      ],
      phases: [
        { name: "Recon", start: "2026-05-01", end: "2026-05-31" },
        { name: "Build-out", start: "2026-06-01", end: "2026-08-15" },
        { name: "Rollout", start: "2026-08-16", end: "2026-11-30" }
      ],
      risks: [
        { text: "Shop space competes with inventory storage", sev: "med" },
        { text: "Equipment arriving too late to stage", sev: "high" }
      ],
      intel: [
        { date: "2026-09-23", text: "Staged rack went live on site in under 2 hours." },
        { date: "2026-09-05", text: "Burn-in checklist caught a failed switch before it shipped." }
      ]
    },
    {
      id: "BO-003",
      codename: "ADVANCE PARTY",
      title: "Pre-Install Prep",
      pillar: "Operations",
      status: "recon",
      clearance: "CONFIDENTIAL",
      lead: "Project Mgmt",
      team: ["Project Mgmt", "Field Lead"],
      start: "2026-09-01",
      end: "2027-01-31",
      impact: 7,
      effort: 3,
      vision:
        "No crew shows up to a site that isn't ready for them.",
      mission:
        "A pre-install checklist and site walk that confirms pathways, power, backboxes, access and material kitting before the crew is scheduled. Kits are pulled and staged the day before.",
      objectives: [
        { text: "Interview crews on the top site-readiness failures", done: true },
        { text: "Pre-install checklist and site walk form", done: false },
        { text: "Material kitting process with the warehouse", done: false }
      ],
      outcomes: [
        { label: "Trips lost to site not ready", unit: "/mo", baseline: 11, current: 11, target: 2, better: "down" },
        { label: "Jobs with a completed site walk", unit: "%", baseline: 20, current: 25, target: 95, better: "up" }
      ],
      phases: [
        { name: "Recon", start: "2026-09-01", end: "2026-10-15" },
        { name: "Build", start: "2026-10-16", end: "2026-12-15" },
        { name: "Rollout", start: "2027-01-01", end: "2027-01-31" }
      ],
      risks: [
        { text: "General contractors not giving early site access", sev: "high" },
        { text: "Extra site walk adds cost to small jobs", sev: "low" }
      ],
      intel: [
        { date: "2026-09-20", text: "Crew interviews done. Top issue: backboxes and pathways missing on arrival." }
      ]
    },
    {
      id: "BO-004",
      codename: "HIGH GROUND",
      title: "Topo Design Model",
      pillar: "Engineering",
      status: "recon",
      clearance: "TOP SECRET",
      lead: "Engineering",
      team: ["Engineering", "Tyson", "Estimating"],
      start: "2026-08-15",
      end: "2027-03-31",
      impact: 9,
      effort: 8,
      vision:
        "One design model per project that drives the drawings, the parts list, the estimate and the install plan.",
      mission:
        "Build a standard topology model for our systems: device types, connections and rooms, with rules that generate riser diagrams and a bill of materials. It becomes the single source for [[Apex Estimating]] and for field documentation.",
      objectives: [
        { text: "Define device and connection library", done: true },
        { text: "Model three past projects end to end", done: false },
        { text: "Generate BOM from the model", done: false },
        { text: "Generate riser diagram from the model", done: false }
      ],
      outcomes: [
        { label: "Design hours per project", unit: "h", baseline: 30, current: 30, target: 12, better: "down" },
        { label: "BOM errors found after award", unit: "/job", baseline: 5, current: 5, target: 1, better: "down" }
      ],
      phases: [
        { name: "Recon", start: "2026-08-15", end: "2026-10-31" },
        { name: "Model", start: "2026-11-01", end: "2027-01-31" },
        { name: "Pilot", start: "2027-02-01", end: "2027-03-31" }
      ],
      risks: [
        { text: "Scope creep: modeling every system type at once", sev: "high" },
        { text: "Design tools don't export clean data", sev: "med" }
      ],
      intel: [
        { date: "2026-09-12", text: "Device library at 180 types across network, AV and security." },
        { date: "2026-08-18", text: "Operation opened. First target: network and cabling topology." }
      ]
    },
    {
      id: "BO-005",
      codename: "PRICE POINT",
      title: "Apex Estimating",
      pillar: "Revenue",
      status: "active",
      clearance: "SECRET",
      lead: "Estimating",
      team: ["Estimating", "Tyson", "Sales"],
      start: "2026-04-01",
      end: "2026-12-31",
      impact: 9,
      effort: 7,
      vision:
        "Estimates that are fast, consistent, and priced from the same parts and labor data every time.",
      mission:
        "Rebuild estimating around a shared parts library and standard labor units, with templates for common system packages and margin checks before anything goes out. Feeds from [[the Topo Design Model]] once it lands.",
      objectives: [
        { text: "Parts library cleaned and priced", done: true },
        { text: "Standard labor units per device", done: true },
        { text: "System package templates", done: true },
        { text: "Margin guardrails and approval step", done: false },
        { text: "Estimate-to-actual feedback loop", done: false }
      ],
      outcomes: [
        { label: "Estimate turnaround", unit: "days", baseline: 7, current: 3, target: 2, better: "down" },
        { label: "Estimated vs actual labor", unit: "% var", baseline: 22, current: 12, target: 8, better: "down" },
        { label: "Win rate", unit: "%", baseline: 28, current: 33, target: 38, better: "up" }
      ],
      phases: [
        { name: "Recon", start: "2026-04-01", end: "2026-04-30" },
        { name: "Build", start: "2026-05-01", end: "2026-09-30" },
        { name: "Rollout", start: "2026-10-01", end: "2026-12-31" }
      ],
      risks: [
        { text: "Vendor price changes outpacing library updates", sev: "high" },
        { text: "Labor units not matching real field times", sev: "med" }
      ],
      intel: [
        { date: "2026-09-24", text: "Package templates used on 9 bids this month. Median turnaround 3 days." },
        { date: "2026-09-02", text: "Labor units calibrated against last year's job actuals." }
      ]
    },
    {
      id: "BO-006",
      codename: "SIGNAL FLARE",
      title: "Apex Marketing",
      pillar: "Revenue",
      status: "hold",
      clearance: "CONFIDENTIAL",
      lead: "Marketing",
      team: ["Marketing", "Sales"],
      start: "2026-10-15",
      end: "2027-04-30",
      impact: 6,
      effort: 4,
      vision:
        "The market sees the quality of our work before we ever walk in the door.",
      mission:
        "Turn finished projects into case studies, photos and proof points, and run targeted campaigns to the verticals we win most. Waiting on [[Apex Estimating rollout]] so leads can be quoted fast.",
      objectives: [
        { text: "Pick target verticals from win data", done: false },
        { text: "Five case studies from recent jobs", done: false },
        { text: "Campaign calendar and lead tracking", done: false }
      ],
      outcomes: [
        { label: "Qualified leads per month", unit: "", baseline: 8, current: 8, target: 20, better: "up" },
        { label: "Published case studies", unit: "", baseline: 0, current: 0, target: 5, better: "up" }
      ],
      phases: [
        { name: "Recon", start: "2026-10-15", end: "2026-11-30" },
        { name: "Content", start: "2026-12-01", end: "2027-02-28" },
        { name: "Campaigns", start: "2027-03-01", end: "2027-04-30" }
      ],
      risks: [
        { text: "Getting client sign-off to publish project photos", sev: "med" }
      ],
      intel: [
        { date: "2026-09-10", text: "Held until Apex Estimating finishes rollout." }
      ]
    }
  ]
};
