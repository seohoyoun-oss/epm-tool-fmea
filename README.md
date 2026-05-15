# AI-Powered Failure Mode and Effects Analysis Assistant

> Tool 1 of 7 in the Engineering Program Manager Tools Portfolio by Seoho Youn.

## The problem this solves

Failure Mode and Effects Analysis is one of the most valuable risk reviews in hardware development and one of the most time-consuming. The quality of an analysis depends heavily on the experience level of whoever leads it. New program managers stare at a blank worksheet and miss obvious failure modes simply because they have not seen the part fail before.

This tool gives every program manager an instant reference library, regardless of experience level. The user describes a hardware system and its key functions in plain language and receives a structured Failure Mode and Effects Analysis they can edit, score, and export. A live Action Priority Matrix then plots the top ten highest-risk items by Risk Priority Number against estimated implementation cost, so the team can immediately see which actions to take first.

## The scenario behind it

In a prior hardware program management role, I ran Failure Mode and Effects Analysis on depth-sensing modules. The bottleneck on quality was always the experience of the program manager leading it. New program managers missed obvious things, not because they were careless, but because they had not seen the part fail before. I wanted to know whether a model could compress that experience gap, so I built this prototype.

## Live URL

Deployed at `epm-tool-fmea.vercel.app`.

## How it works

The user enters a system description and an optional list of key functions. The browser sends both to a Vercel serverless function at `/api/fmea`. That function calls the Anthropic Application Programming Interface server-side using a key stored in environment variables. The Anthropic key never reaches the browser bundle. The function returns sanitized rows, the browser renders an editable table sorted by Risk Priority Number, and a quadrant chart plots the top ten rows by risk against estimated action cost.

```
Browser  ──POST /api/fmea──>  Vercel serverless function  ──>  Anthropic API
         { description,                  │
           functions }          Sanitize and validate
                                         │
                                         ▼
Browser  <──── editable rows ────────────┘
         (table + quadrant chart)
```

## Technology stack

- Vite plus React 18 for the browser application
- Tailwind CSS for styling
- Anthropic Software Development Kit (`claude-sonnet-4-6`) for the model call
- PapaParse for comma-separated values export
- Vercel serverless functions for the secure API proxy
- Vercel for hosting (free tier)

## Features

**Two-field input.** The system description gives the model the hardware context. The optional key-functions list anchors the analysis to what the system is actually supposed to do, reducing generic boilerplate rows.

**Editable table, top 10 by RPN.** The generated rows are sorted by Risk Priority Number and the top ten are shown. Every cell is editable inline. Severity, Occurrence, and Detection scores are integer inputs clamped to 1–10; the Risk Priority Number column recalculates automatically on every edit. Rows can be removed individually.

**Action Priority Matrix.** A live quadrant chart plots the top ten rows on two axes: Risk Priority Number (vertical) against estimated implementation cost (horizontal, 1–10 scale). Quadrant labels guide triage:

- **P1 — High Risk / Low Cost:** act immediately, easy wins
- **P2 — Low Risk / Low Cost:** schedule when convenient
- **P3 — High Risk / High Cost:** plan carefully, may need phased approach
- **P4 — Low Risk / High Cost:** deprioritize or defer

Hovering a dot shows the failure mode, recommended action, scores, and quadrant. Dots animate when scores change.

**CSV export.** All rows (not just the displayed top ten) export to a comma-separated values file ready for the team's working document.

**Built-in example.** A one-click "Load DSLR camera example" button pre-fills the description and key functions for a consumer DSLR camera body, so the tool can be demonstrated without typing.

## Local development

```bash
# 1. Install dependencies
npm install

# 2. Copy the environment template and fill in your Anthropic key
cp .env.example .env
# then edit .env

# 3. Run the development server
# (See note below — local serverless function support requires the Vercel CLI.)
npm run dev
```

For local end-to-end testing including the serverless function, use the Vercel CLI:

```bash
npm install -g vercel
vercel dev
# This serves both the Vite dev server and the /api/fmea function on one port.
```

## Deployment

See [DEPLOY.md](./DEPLOY.md) for the step-by-step guide.

## Repository layout

```
epm-tool-fmea/
├── api/
│   └── fmea.js                 Vercel serverless function — Anthropic proxy
├── src/
│   ├── App.jsx                 Application shell; side-by-side table + chart layout
│   ├── main.jsx                React entry point
│   ├── index.css               Tailwind base
│   ├── components/
│   │   ├── SystemInput.jsx     Two-field form (description + functions) with DSLR example
│   │   ├── FmeaTable.jsx       Editable table, top 10 by RPN, auto Risk Priority Number
│   │   ├── QuadrantChart.jsx   Action Priority Matrix — Risk vs. Implementation Cost
│   │   ├── ExportButton.jsx    Comma-separated values export (all rows)
│   │   └── PortfolioFooter.jsx Cross-portfolio branding
│   └── lib/
│       ├── apiClient.js        Browser-side fetch wrapper
│       └── promptTemplates.js  Anthropic prompt template (description + functions)
├── public/
│   └── examples/
│       ├── depth-module.json   Depth-sensing module example dataset
│       └── dslr-camera.json    Consumer DSLR camera example dataset
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── vercel.json
├── .env.example
├── .gitignore
├── README.md
└── DEPLOY.md
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

Each generation uses roughly 4000 input tokens and 3000 output tokens. At Sonnet pricing this is on the order of five cents per generation. A budget alert at 50 dollars in the Anthropic console is a reasonable backstop.

## Disclaimer

This tool and all example data it contains are created solely for portfolio and educational demonstration purposes. The example system description, failure modes, severity ratings, and recommended actions are illustrative estimates generated by a large language model. They are not derived from, representative of, or associated with any proprietary review, internal process, confidential specification, or employer. Any resemblance to actual product parameters or internal analyses is coincidental. This tool is not intended for use in product design, safety validation, hardware acceptance testing, or any commercial application. All outputs should be reviewed and validated by qualified engineers before use in any real engineering context.

## License

Personal portfolio project. Not for production use without review.
