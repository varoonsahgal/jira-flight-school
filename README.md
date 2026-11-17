# Jira Flight School ✈

Course site for **Working with Jira** for Digital Technology teams, served with GitHub Pages.

| Page | What it is |
|---|---|
| `index.html` | Home: departures board, levels, pilot logbook, pre-flight checklist |
| `syllabus.html` | Full syllabus: modules, objectives, durations, formats, prerequisites, demo and sandbox plan, asks |
| `ground-school.html` | Level 1: Getting to Know Jira, plus the Rovo readiness checkride |
| `first-officer.html` | Level 2: Golden Template, planning, JQL, dashboards, Zephyr essentials |
| `captain.html` | Level 3: advanced JQL, Plans, eazyBI, Zephyr at scale, automation and agents, MCP, Git |
| `rovo.html` | Rovo Flight Manual (all levels) |
| `jql-simulator.html` | Interactive JQL challenges against the sandbox |
| `mcp.html` | Claude + Atlassian MCP handbook and Co-Pilot Protocol |
| `missions.html` | Mission Control and the IROPS Day capstone |

## Sandbox

Missions run against the **FLY – Flight Deck Digital (Training)** space. Every JQL block has a **Run in Jira ↗** button. To point it at another Jira site, use the field in the site footer (the setting is saved per browser).

## Local preview

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Mission Control's index is built by fetching the level pages, so it needs http(s). It won't load from `file://`.

Progress (miles, checklists, quiz results) is stored in each learner's browser with `localStorage`. Nothing is sent to a server.
