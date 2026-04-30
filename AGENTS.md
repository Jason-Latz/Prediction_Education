# Global AGENTS.md

Machine-level rules for all agent work.

## Mandatory Learning Capture

Any time an agent learns either:

1. A mistake the agent made, or
2. A user preference, especially Jason's preferences,

the agent must update this file to record that learning as an explicit, actionable rule.

Do not leave that learning only in chat history.

## Learned Rules

- When scaffolding a JavaScript or Next.js project in a directory whose basename is not a valid npm package name, do not rely on in-place `create-next-app`; either scaffold manually with a valid `package.json` name or use a valid subdirectory.
- When Jason asks for a minimum commit count, make the commits meaningful and useful for understanding the build history; do not satisfy the count with padding commits.
- For educational simulations, verify the domain behavior numerically, not just visually; run a sweep that confirms the variables intended to matter produce visibly different outcomes and inert variables remain inert.
