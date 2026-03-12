# Learn Anything

An interactive learning platform where you can explore concepts through visual experiments, tweak parameters in real time, and build your own understanding — not just read about it.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| State | Zustand |
| Monorepo | Turborepo |
| Package Manager | pnpm |

## Requirements

- **Node.js** >= 18
- **pnpm** >= 9

Install pnpm if you don't have it:
```bash
# Via official install script (recommended — no sudo needed)
curl -fsSL https://get.pnpm.io/install.sh | sh -

# Then reload your shell or run:
source ~/.bashrc   # or ~/.zshrc

# Verify
pnpm --version
```

## Getting Started

```bash
# 1. Clone the repository
git clone <repo-url>
cd learn-anything

# 2. Install all dependencies (installs across all packages and apps)
pnpm install

# 3. Start the development server
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
learn-anything/
├── apps/
│   └── web/                    # Next.js app (main website)
├── packages/
│   ├── ui/                     # Shared base UI components (Button, Badge, etc.)
│   ├── visualizations/         # Reusable interactive visual components (D3, Canvas)
│   ├── simulations/            # Pure TS algorithm/simulation logic (no UI)
│   └── content-config/         # Types, schemas, level definitions, and nav data
├── content/                    # MDX lesson content
│   └── programming/
│       └── algorithms/
├── .cursorrules                # Coding rules and conventions for AI editors
├── turbo.json                  # Turborepo pipeline config
└── pnpm-workspace.yaml         # Monorepo workspace definition
```

## Adding a New Topic

1. Add the topic to `packages/content-config/src/nav.ts` under the appropriate area with a `level` assigned.
2. Create a `_meta.json` in `content/[area]/[topic]/`.
3. Add `.mdx` files in that directory for each subtopic.
4. If the topic needs a visualization, create the component in `packages/visualizations/` — never inside the page itself.

## Content Levels

Every topic and piece of content must be tagged with a level:

| Level | Description |
|---|---|
| `beginner` | No prior knowledge required |
| `intermediate` | Requires familiarity with the area basics |
| `advanced` | Deep knowledge required, often math-heavy |

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start all apps in dev mode |
| `pnpm build` | Build all apps and packages |
| `pnpm lint` | Lint all packages |
| `pnpm type-check` | TypeScript type check across all packages |

## Coding Rules

All contributors (and AI editors) must follow the rules in `.cursorrules`. Key points:

- **Reusability first** — no component is embedded in a single page
- **Every content item must have a level** (`beginner`, `intermediate`, `advanced`)
- **Visualizations are data-driven** — no hardcoded content inside components
- **Simulations are pure TypeScript** — no React in `packages/simulations`
- **MDX for content** — all lesson text lives in `content/`, not in components
