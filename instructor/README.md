# Instructor kit

Use this kit to run Jira Flight School with up to 20 students at the same time.

## The three-part training environment

| Space / board | Who writes? | Purpose |
|---|---|---|
| **FLY · Flight Deck Digital (Training)** | Nobody except the instructor | Read-only reference aircraft: Golden-Template-style workflow, sprint history, bounce-backs, regressions and deliberate data-quality traps. Every JQL answer on the site is verified against it. |
| **HGR · Hangar (Student Practice)** | Students, each in their own seat | Seats 01–20. Each seat has a label `seat-NN`, an epic `SNN · Meal Pre-order`, a 14-item backlog (60 points) and its own Scrum board. |
| **Velocity Forensics (read-only)** board in HGR | Nobody | Six engineered sprints (`FOR-2026.q3.1`–`.6`), one per velocity mechanic: clean, scope creep, re-estimation, carry-over, Ready-for-Release and sub-task trap, backdated start. |

## Permissions to set before class
- **FLY:** students get *Browse projects* only. Optionally allow *Add comments* if you run the Rovo summary demos live.
- **HGR:** students get *Browse*, *Create*, *Edit*, *Transition*, *Schedule*, *Link* and **Manage sprints**. Manage sprints is needed for the Velocity Lab sprint missions.
- Don't give students *Administer projects*. They don't need it.

## Seat assignment
Hand out seat numbers 01–20 on the attendee list. Learners pick their seat in the site's top bar. Every `{SEAT}` in lab text and JQL then becomes their number, and **Open my seat board ↗** links to their own board.

## Watching the room
- `project = HGR AND updated >= -15m ORDER BY updated DESC`: live activity feed.
- A dashboard **Two-Dimensional Filter Statistics** gadget on `project = HGR`, with Labels as the X axis and Status as the Y axis, shows progress per seat.
- `project = FLY AND updated >= -1h`: should stay empty during class. If it doesn't, someone wrote to the reference aircraft.

## Reset between cohorts
Run [`reset-seats.js`](reset-seats.js) from the browser console while signed in as an admin. It's non-destructive:
1. Original seat items go back to To Do with their original points and come out of sprints.
2. Anything students created is relabeled `archived-seat-NN`, so it leaves the board but stays searchable.
3. A fresh board is created per seat, so the next cohort's velocity chart starts empty.
4. It prints a new `SEAT_BOARDS` map. Paste that into `assets/js/site.js` and push.
