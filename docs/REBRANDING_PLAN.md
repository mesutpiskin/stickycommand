# StickyCommand Rebranding Plan

## Goal
Transform the abandoned Command Pad fork into an actively maintained StickyCommand project with valid links, updated identity, and a clean migration path.

## Scope
- Product identity: app name, package names, display strings, metadata
- Documentation: README rewrite, stale links cleanup
- Runtime text: menu labels, notifications, welcome/about pages
- Repository migration: archive old fork privately, move active development to new repo

## Constraints
- Keep existing functionality stable while rebranding
- Keep migration auditable (single cohesive commit)
- Avoid introducing breaking build/toolchain changes during branding

## Work Plan
1. Baseline audit
- Find all Command Pad/supnate links and product labels
- Identify dead release/update URLs

2. Brand updates in code
- Rename product labels to StickyCommand
- Update app metadata (name, productName, appId, homepage)
- Update in-app about/welcome/update notification messages

3. Docs overhaul
- Rewrite README for current state
- Remove stale download links and unsupported claims
- Add development-first instructions and roadmap

4. Repository migration
- Make current fork private (archive lineage)
- Create new repository named stickycommand
- Re-point git origin and push migrated code

5. Validation
- Run build
- Verify key screens render and text updates appear
- Verify links point to new repository

## Success Criteria
- No stale upstream links remain in primary user-facing files
- Build succeeds after rebranding updates
- New repository receives the migrated code and becomes active origin
