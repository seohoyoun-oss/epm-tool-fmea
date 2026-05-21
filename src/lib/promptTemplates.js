// Prompt template for the Failure Mode and Effects Analysis generator.
// Kept in a dedicated file so it can be tuned without touching application logic.

export function buildFmeaPrompt({ description }) {
  return `You are an expert hardware reliability engineer with deep experience running Failure Mode and Effects Analysis on consumer electronics and robotics products. The user is a hardware program manager who needs a high-quality first draft of an analysis they will then review and refine.

The following design change(s) are being evaluated:
${description}

Produce a Failure Mode and Effects Analysis with between 12 and 20 rows focused specifically on failure modes introduced or affected by these design changes. Cover relevant failure modes across mechanical, electrical, firmware, manufacturing, thermal, and field-use domains as applicable. Bias toward failure modes that an experienced hardware engineer would actually flag in a real design review, not generic boilerplate.

Keep all text fields short and scannable. Use key technology terms so an engineer can understand each row at a glance.

For each row provide:
- customerImpact: plain-language symptom a consumer would notice, no jargon (8 words max — e.g. "Photos come out blurry", "Camera won't power on")
- function: the system function being considered (5 words max)
- failureMode: how the function fails (5 words max)
- effect: technical consequence, key terms only (10 words max)
- cause: most likely root cause with key technology terms (10 words max)
- severity: integer 1 to 10. 1 means no user impact. 10 means catastrophic user impact or safety risk.
- occurrence: integer 1 to 10. 1 means effectively impossible at the stated production volume. 10 means nearly certain.
- detection: integer 1 to 10. 1 means current standard test methods will catch it before shipping. 10 means there is no realistic way to catch it.
- recommendedAction: one concrete engineering action, key terms only (12 words max). Be specific about which dimension it addresses.
- actionCost: integer 1 to 10. Estimated relative cost and effort to implement the recommendedAction. 1 means trivial — a process check, a test parameter change, or something already nearly in place. 10 means a major program investment — new equipment, significant design change, or multi-month qualification effort.
- teams: comma-separated list of team abbreviations responsible for resolving this failure mode. Use only: ME (Mechanical Eng), EE (Electrical Eng), OE (Optical Eng), SW (Software), FW (Firmware), SYS (Systems Eng), MFG (Manufacturing), QA (Quality Assurance), TE (Test Eng). List only the teams that are truly relevant — typically 1 to 3.

Return only valid JSON in exactly this shape, with no surrounding prose, no markdown fences, no explanation:
{
  "rows": [
    {
      "customerImpact": "string",
      "function": "string",
      "failureMode": "string",
      "effect": "string",
      "cause": "string",
      "severity": 0,
      "occurrence": 0,
      "detection": 0,
      "recommendedAction": "string",
      "actionCost": 0,
      "teams": "string"
    }
  ]
}`
}
