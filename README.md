# Character Recipe Studio

A desktop authoring suite for creating, managing, and validating structured AI character recipes, behavioural rules, and system prompts.

## Features
- **Structured Recipe Editor:** Define identities, tags, personality traits, and dialogue constraints.
- **Schema Validation:** Strict type-safe export into portable JSON recipe configurations.
- **Tauri Integration:** Native desktop ergonomics with fast load times and local filesystem access.

## Tech Stack
- React 19 + TypeScript + Vite
- Tauri v2 (Rust backend)

## Setup & Running

```bash
# Install dependencies
npm install

# Run development mode
npm run tauri dev

# Build release
npm run tauri build
```
