<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:openspec-agent-rules -->
# OpenSpec workflow

Use OpenSpec for non-trivial feature work, behavior changes, architecture updates, and bug fixes that need a clear implementation contract.

- Check existing specs with `openspec list --specs` and active changes with `openspec list` before starting.
- Create new change proposals with `/opsx:propose "description"` or `openspec new change <change-name>`.
- Keep proposal, design, specs, and tasks under `openspec/changes/<change-name>/`.
- Implement only after the change artifacts are ready, then keep `tasks.md` updated as work progresses.
- Validate with `openspec validate <change-name>` before considering the change complete.
- Archive completed changes with `/opsx:archive` or `openspec archive <change-name>` so durable specs under `openspec/specs/` stay current.
<!-- END:openspec-agent-rules -->
