# AI-Powered Failure Mode and Effects Analysis Assistant

> Part of the Engineering Program Manager Tools Portfolio — built by Claude and Seoho Youn.

**Live:** [epm-tool-fmea-qkrh.vercel.app](https://epm-tool-fmea-qkrh.vercel.app)

## The problem this solves

Failure Mode and Effects Analysis is one of the most valuable risk reviews in hardware development and one of the most time-consuming. When a design change is proposed, a program manager needs to quickly identify which failure modes the change could introduce or worsen — and rank them so the team knows where to act first.

This tool takes a description of a design change, generates a structured FMEA focused on that change, and immediately plots the results in an Action Priority Matrix that maps Risk Priority Number against implementation cost. The output is editable, exportable, and ready to bring into a design review.

## The scenario behind it

In a prior hardware program management role, I ran Failure Mode and Effects Analysis on depth-sensing modules. The bottleneck on quality was always the experience of the program manager leading it. New program managers missed obvious failure modes — not because they were careless, but because they had not seen the part fail before. I wanted to know whether a language model could compress that experience gap, so I built this tool.

## How it works

The user follows a four-step workflow:

1. **Review the ERS** — the Engineering Requirements Specification for the Robot Vacuum is preloaded as a reference
2. **Enter the design change(s)** — one change per line describing what is being modified
3. **Generate** — the browser sends the design change to a Vercel serverless function, which calls the Anthropic API server-side; the key never reaches the browser
4. **Review and export** — an editable FMEA table and Action Priority Matrix appear; results can be exported as CSV or PNG

```
Browser  ──POST /api/fmea──>  Vercel serverless function  ──>  Anthropic API
         { designChange }               │
                               Sanitize and validate
                                        │
                                        ▼
Browser  <──── editable rows ───────────┘
         (FMEA table + Action Priority Matrix)
```

## Features

**Step-by-step workflow.** Numbered steps guide the user from ERS review through design change input, generation, and export. Reduces the blank-page problem.

**ERS Preview.** A button opens the preloaded Engineering Requirements Specification (Robot Vacuum) in a new tab, giving the user the system context before they describe the change.

**Design-change-focused prompt.** The AI prompt is scoped specifically to failure modes introduced or affected by the stated design change — not a generic system survey. This produces more targeted, actionable rows.

**Editable FMEA table, top 10 by RPN.** Generated rows are sorted by Risk Priority Number; the top ten are shown. Every cell is editable inline. Severity, Occurrence, and Detection scores are integer inputs clamped to 1–10; the RPN column recalculates automatically on every edit. Rows can be removed individually.

**Action Priority Matrix.** A live quadrant chart plots the top ten rows on two axes: Risk Priority Number (vertical) against estimated implementation cost (horizontal, 1–10 scale). Quadrant labels guide triage:

- **P1 — High Risk / Low Cost:** act immediately, easy wins
- **P2 — Low Risk / Low Cost:** schedule when convenient
- **P3 — High Risk / High Cost:** plan carefully, may need phased approach
- **P4 — Low Risk / High Cost:** deprioritize or defer

Hovering a dot shows the failure mode, recommended action, scores, and quadrant. Dots animate when scores change.

**Export to CSV.** All rows export to a comma-separated values file ready for the team's working document.

**Export to PNG.** Captures the full Action Priority Matrix — title, description, chart, and legend — as a high-resolution PNG for slides or reports.

## Technology stack

- Vite + React 18 for the browser application
- Tailwind CSS for styling
- Anthropic SDK (`claude-sonnet-4-6`) for the model call
- PapaParse for CSV export
- html2canvas for PNG export
- Vercel serverless functions for the secure API proxy
- Vercel for hosting (free tier)

## Local development

```bash
# 1. Install dependencies
npm install

# 2. Copy the environment template and fill in your Anthropic key
cp .env.example .env
# edit .env and set ANTHROPIC_API_KEY=sk-ant-...

# 3. Start both the API dev server and Vite together
npm run dev
# Vite: http://localhost:5173
# API:  http://localhost:3001 (proxied automatically by Vite)
```

The `dev` script runs `dev-server.js` (a minimal Node HTTP server that wraps `api/fmea.js`) alongside Vite, so the full stack works without the Vercel CLI.

## Deployment

Deployed on Vercel. See [DEPLOY.md](./DEPLOY.md) for the step-by-step guide.

The only required environment variable is `ANTHROPIC_API_KEY`, set in Vercel project settings under Environment Variables.

## Repository layout

```
epm-tool-fmea/
├── api/
│   └── fmea.js                 Vercel serverless function — Anthropic proxy
├── src/
│   ├── App.jsx                 Application shell; 4-step layout, side-by-side table + chart
│   ├── main.jsx                React entry point
│   ├── index.css               Tailwind base
│   ├── components/
│   │   ├── SystemInput.jsx     Steps 1–3: ERS preview, design change input, generate button
│   │   ├── FmeaTable.jsx       Editable table, top 10 by RPN, auto RPN recalculation
│   │   ├── QuadrantChart.jsx   Action Priority Matrix — Risk vs. Implementation Cost
│   │   ├── ExportButton.jsx    CSV and PNG export
│   │   └── PortfolioFooter.jsx Footer attribution
│   └── lib/
│       ├── apiClient.js        Browser-side fetch wrapper
│       └── promptTemplates.js  Design-change-focused FMEA prompt
├── public/
│   ├── ERS_Robot_Vacuum.pdf    Preloaded Engineering Requirements Specification
│   ├── claude-logo.svg         Claude brand mark (footer)
│   ├── avatar_pixel_v2.png     Author avatar (footer)
│   └── examples/
│       ├── depth-module.json   Depth-sensing module reference dataset
│       └── dslr-camera.json    DSLR camera reference dataset
├── dev-server.js               Local API server (wraps api/fmea.js for npm run dev)
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── vercel.json
├── .env.example
├── .gitignore
└── README.md
```

## Data model

Each row returned by the API contains:

| Field | Type | Description |
|---|---|---|
| `customerImpact` | string | Plain-language symptom a consumer would notice |
| `function` | string | The system function being considered |
| `failureMode` | string | How the function fails |
| `effect` | string | Technical consequence |
| `cause` | string | Most likely root cause |
| `severity` | 1–10 | How serious the effect is |
| `occurrence` | 1–10 | How likely the failure is |
| `detection` | 1–10 | How likely current tests catch it (10 = unlikely to catch) |
| `rpn` | computed | severity × occurrence × detection |
| `recommendedAction` | string | One concrete engineering action |
| `actionCost` | 1–10 | Estimated cost/effort to implement the action |
| `teams` | string | Comma-separated responsible team abbreviations (ME, EE, OE, SW, FW, SYS, MFG, QA, TE) |

## Cost expectations

Each generation uses roughly 4,000 input tokens and 3,000 output tokens. At Sonnet pricing this is on the order of five cents per generation. A budget alert at $50/month in the Anthropic console is a reasonable backstop.

## Disclaimer

This tool and all example data it contains are created solely for portfolio and educational demonstration purposes. The example design changes, failure modes, severity ratings, and recommended actions are illustrative estimates generated by a large language model. They are not derived from, representative of, or associated with any proprietary review, internal process, confidential specification, or employer. Any resemblance to actual product parameters or internal analyses is coincidental. This tool is not intended for use in product design, safety validation, hardware acceptance testing, or any commercial application. All outputs should be reviewed and validated by qualified engineers before use in any real engineering context.

## License

Personal portfolio project. Not for production use without review.
