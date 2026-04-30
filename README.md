# Prediction Playground

Prediction Playground is a Papert-inspired physics microworld for children to explore how inputs change outcomes. It is built as a Next.js app for Vercel and uses Matter.js for the rollout simulation.

## Microworld

The app is intentionally open-ended. Children choose a ramp setup, place a prediction marker, roll, then compare the marker against the actual landing point. Repeated rolls leave visible traces so patterns emerge through play.

## Variables

- Ramp height
- Ball size
- Ball weight
- Shape
- Texture
- Color
- Clean or messy world mode

Color is present as a visible variable that does not affect the physics model. The app does not announce that rule during play; the comparison tools let children discover it.

## Features

- Canvas playground with draggable prediction flag
- Matter.js rollout simulation
- Ghost trails and landing dots
- Challenge targets for optional goals
- Side-by-side comparison between recent runs
- Local prediction history
- Lightweight theory pad
- Responsive layout for classroom tablets and laptops

## Development

```bash
npm install
npm run dev
```

## Checks

```bash
npm run lint
npm run build
```

## References

- Seymour Papert, *Mindstorms: Children, Computers, and Powerful Ideas*
- Papert's constructionist idea of microworlds as small worlds for exploring powerful ideas
