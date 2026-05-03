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
- When Jason requests adding a variable he expects may have little or no effect, keep it available for inquiry but add a regression check so it does not accidentally dominate the phenomena students are meant to notice.
- Jason prefers the physics simulator to model real-world physics accurately; do not present tuned/game-physics behavior as physically accurate, and prefer explicit physics equations plus documented assumptions.
- For high-fidelity simulator work, add regression checks for visually plausible contact and transition behavior; landing-distance sweeps alone do not catch impossible ramp exits or unstable final poses.
