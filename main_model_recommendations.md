# Main Model Recommendations

In an AI agent system, the **main model** is the primary reasoning model that acts as the agent's brain. It reads the user's message, decides what the user wants, chooses which tools or API calls to use, interprets the results, and writes the final response.

You do not need to use the same model for every task. A strong automation stack can use one model as the main agent brain, then use cheaper or more specialized models for classification, extraction, voice, document work, or writing.

| Use Case | Recommended Main Model |
| --- | --- |
| General lead automation | OpenAI GPT-5.4 mini |
| Appointment booking / CRM updates | OpenAI |
| Sales copilot / email writing | Claude Sonnet 4.6 |
| Complex document Q&A | Claude Sonnet or Opus |
| Cheap classification | Gemini Flash-Lite / Claude Haiku / OpenAI mini |
| Voice agent | Start with Retell/Vapi defaults, test OpenAI vs Claude |
| Building the automations | Use Claude Code + OpenAI/Codex if you can |

## Practical Default

For a startup building automation systems in the next week, start with **OpenAI as the default production main model** because it is broadly supported across agent tools, APIs, no-code platforms, and voice platforms.

Use **Claude** when the task needs stronger writing, longer reasoning, richer summaries, or more natural business communication.
