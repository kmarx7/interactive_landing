# Interactive Landing Studio development conventions

- Read the existing schema, registry, renderer, and docs before changing a feature.
- Keep Content, Design, Behavior, Motion, Rendering, Persistence, and Editor responsibilities separate.
- Work on `feature/<feature-name>` branches when introducing a distinct feature. Do not mix unrelated features or commit directly to main. The first implementation lives on `feature/ils-studio-v1.1`.
- Do not push unless the user has authorized it in the session. Do not deploy or connect external services without explicit authorization.
- Never delete user projects, existing tests, or files as an implementation shortcut.
- Store browser project data in IndexedDB. Display save success only after transaction completion. Preserve pending drafts, validate imports, and never overwrite a project on import.
- Accept only registered components and schema versions. Do not execute user code, arbitrary HTML, or JSON as JavaScript.
- Reuse PageRenderer for templates, previews, and future exports. Heavy simulation / 3D code must load only when used.
- Keep incomplete functions visibly unavailable. The 27 unfinished styles remain catalog entries with disabled application.
- Run `npm test`, `npm run typecheck`, `npm run build`, and `npm run format:check` for material changes. Run browser verification when the environment supports it; document restrictions accurately.
- Keep README and docs/ROADMAP.md current with actual implementation scope.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
