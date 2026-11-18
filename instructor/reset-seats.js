/*
  Jira Flight School: reset the Hangar (HGR) seats between cohorts.

  HOW TO RUN
  1. Sign in to the training Jira site as a Jira admin.
  2. Open any Jira page on that site, open DevTools (Cmd/Ctrl+Opt+I) and choose Console.
  3. Paste this whole file and press Enter. Progress is logged to the console.

  WHAT IT DOES (non-destructive: nothing is deleted)
  - For each seat 01..20 (or the SEATS list below):
    * Original practice items (the 14 "S{NN} · ..." backlog items and the seat epic):
      reset to To Do, original story points restored, removed from sprints.
    * Anything a student created (other summaries) is relabeled from seat-NN to
      archived-seat-NN, so it leaves the seat board but stays searchable.
    * A fresh Scrum board "Seat NN - Hangar Board (cohort YYYY-MM-DD)" is created, so the
      new cohort's velocity chart and sprint history start clean.
  - Prints a SEAT_BOARDS map. Paste it into assets/js/site.js (SEAT_BOARDS) so the
    "Open my seat board" links point at the new boards, then push the site.

  The old boards keep their sprint history for your records. Delete them from the UI
  if you no longer need them.
*/
(async () => {
  const PROJECT = "HGR";
  const SEATS = Array.from({ length: 20 }, (_, i) => String(i + 1).padStart(2, "0"));
  const ORIGINAL = {
    "As a traveler, I can pre-order a meal up to 24h before departure": 5,
    "As a traveler, I can see allergen info for each meal": 3,
    "As a traveler, I get a reminder to pre-order my meal": 2,
    "As a crew member, I see meal pre-orders by seat on my tablet": 8,
    "As a traveler, I can change my pre-order until 12h before departure": 3,
    "As a traveler, I can pay for a premium meal with a saved card": 5,
    "As a traveler, I can rate my meal after the flight": 1,
    "As catering, I receive pre-order counts per flight 18h before departure": 5,
    'As a traveler, I see "sold out" when a meal runs out': 3,
    "As a traveler with a special diet, my profile pre-fills meal preferences": 8,
    "Spike: evaluate the catering partner API (2-day time-box)": 2,
    "As a traveler, I can pre-order meals for everyone on my booking": 13,
    "Meal photos do not load on slow connections": 2,
    "As a traveler, I can leave a tip for the cabin crew": null,
    "Meal Pre-order": "epic"
  };
  const POINTS_FIELD = "customfield_10036"; // "Story Points" on the training site; check yours
  const J = (u, m, b) => fetch(u, { method: m || "GET", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: b ? JSON.stringify(b) : undefined })
    .then(async r => { const t = await r.text(); try { return { s: r.status, d: JSON.parse(t) }; } catch (e) { return { s: r.status, d: t }; } });
  const search = async jql => { let out = [], token; do { const r = await J("/rest/api/3/search/jql", "POST", { jql, fields: ["summary", "status", "labels", "issuetype"], maxResults: 100, nextPageToken: token }); out = out.concat(r.d.issues || []); token = r.d.nextPageToken; } while (token); return out; };
  const toDo = async key => { const t = (await J(`/rest/api/3/issue/${key}/transitions`)).d.transitions.find(x => x.to.statusCategory.key === "new"); if (t) await J(`/rest/api/3/issue/${key}/transitions`, "POST", { transition: { id: t.id } }); };
  const projectId = (await J(`/rest/api/3/project/${PROJECT}`)).d.id;
  const stamp = new Date().toISOString().slice(0, 10);
  const boards = {};

  for (const seat of SEATS) {
    const label = "seat-" + seat;
    const items = await search(`project = ${PROJECT} AND labels = ${label}`);
    let reset = 0, archived = 0;
    const backlogKeys = [];
    for (const it of items) {
      const bare = it.fields.summary.replace(/^S\d\d · /, "");
      if (Object.prototype.hasOwnProperty.call(ORIGINAL, bare)) {
        if (it.fields.status.statusCategory.key !== "new") await toDo(it.key);
        if (ORIGINAL[bare] !== "epic") {
          await J(`/rest/api/3/issue/${it.key}`, "PUT", { fields: { [POINTS_FIELD]: ORIGINAL[bare] } });
          backlogKeys.push(it.key);
        }
        reset++;
      } else {
        const labels = it.fields.labels.filter(l => l !== label).concat("archived-" + label);
        await J(`/rest/api/3/issue/${it.key}`, "PUT", { fields: { labels } });
        archived++;
      }
    }
    for (let i = 0; i < backlogKeys.length; i += 50) await J("/rest/agile/1.0/backlog/issue", "POST", { issues: backlogKeys.slice(i, i + 50) });
    const f = await J("/rest/api/3/filter", "POST", { name: `HGR - Seat ${seat} (${stamp})`, jql: `project = ${PROJECT} AND labels = ${label} ORDER BY Rank ASC`, sharePermissions: [{ type: "project", project: { id: projectId } }] });
    const b = await J("/rest/agile/1.0/board", "POST", { name: `Seat ${seat} - Hangar Board (cohort ${stamp})`, type: "scrum", filterId: +f.d.id, location: { type: "project", projectKeyOrId: PROJECT } });
    boards[seat] = b.d.id;
    console.log(`Seat ${seat}: reset ${reset}, archived ${archived}, new board ${b.d.id}`);
  }
  console.log("Paste into assets/js/site.js → SEAT_BOARDS:");
  console.log(JSON.stringify(boards));
})();
