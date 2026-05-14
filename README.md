# AI-Powered Failure Mode and Effects Analysis Assistant

> Tool 1 of 7 in the Engineering Program Manager Tools Portfolio by Seoho Youn.

## The problem this solves

Failure Mode and Effects Analysis is one of the most valuable risk reviews in hardware development and one of the most time-consuming. The quality of an analysis depends heavily on the experience level of whoever leads it. New program managers stare at a blank worksheet and miss obvious failure modes simply because they have not seen the part fail before.

This tool gives every program manager an instant reference library, regardless of experience level. The user describes a hardware system in plain language and receives a structured Failure Mode and Effects Analysis they can edit, score, and export to comma-separated values for the team's working file.

## The scenario behind it

In a prior hardware program management role, I ran Failure Mode and Effects Analysis on depth-sensing modules. The bottleneck on quality was always the experience of the program manager leading it. New program managers missed obvious things, not because they were careless, but because they had not seen the part fail before. I wanted to know whether a model could compress that experience gap, so I built this prototype.

## Live URL

To be added once deployed.

## How it works

The browser sends the user's system description to a Vercel serverless function at `/api/fmea`. That function calls the Anthropic Application Programming Interface server-side using a key stored in environment variables. The Anthropic key never reaches the browser bundle. The function returns sanitized rows, the browser renders an editable table, and the user can export to comma-separated values at any time.

```
Browser  ──POST /api/fmea──>  Vercel serverless function  ──>  Anthropic API
                                       │
                                       ▼
                              Sanitize and validate
                                       │
                                       ▼
Browser  <──── editable rows ──────────┘
```

## Technology stack

- Vite plus React 18 for the browser application
- Tailwind CSS for styling
- Anthropic Software Development Kit for the model call
- PapaParse for comma-separated values export
- Vercel serverless functions for the secure API proxy
- Vercel for hosting (free tier)

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
│   ├── App.jsx                 Application shell
│   ├── main.jsx                React entry point
│   ├── index.css               Tailwind base
│   ├── components/
│   │   ├── SystemInput.jsx     System description form with example loader
│   │   ├── FmeaTable.jsx       Editable table with auto Risk Priority Number
│   │   ├── ExportButton.jsx    Comma-separated values export
│   │   └── PortfolioFooter.jsx Cross-portfolio branding
│   └── lib/
│       ├── apiClient.js        Browser-side fetch wrapper
│       └── promptTemplates.js  Anthropic prompt template
├── public/
│   └── examples/
│       └── depth-module.json   Default example dataset
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

## Cost expectations

Each generation uses roughly 4000 input tokens and 3000 output tokens. At Sonnet pricing this is on the order of five cents per generation. A budget alert at 50 dollars in the Anthropic console is a reasonable backstop.

## License

Personal portfolio project. Not for production use without review.
