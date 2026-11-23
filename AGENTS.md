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
