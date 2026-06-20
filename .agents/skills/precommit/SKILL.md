---
name: precommit
description: Run the pre-commit lint/format pipeline on staged files only, mirroring what lint-staged does. Use when the user wants to lint and format staged files before committing, or says "run pre-commit", "lint staged", "format staged files".
---

# Pre-commit Skill

Mirror the `lint-staged` pre-commit pipeline: auto-fix then verify, but only on **staged files**.

## Step 0 — Identify staged files

```
git diff --cached --name-only --diff-filter=ACM
```

Split the output into two lists:
- **ts_files**: staged files matching `*.ts` or `*.tsx`
- **css_files**: staged files matching `*.css` under `src/css/`

If both lists are empty, report "No staged files to lint." and stop.

## Steps (run sequentially, stop and report on any failure)

**Step 1 — Format staged TS/TSX files (dprint)**

Only if `ts_files` is non-empty:
```
./node_modules/.bin/dprint fmt <ts_files...>
```

**Step 2 — Lint-fix staged TS/TSX files (oxlint)**

Only if `ts_files` is non-empty:
```
./node_modules/.bin/oxlint --fix <ts_files...>
```

**Step 3 — CSS lint-fix staged CSS files (stylelint)**

Only if `css_files` is non-empty:
```
./node_modules/.bin/stylelint --fix <css_files...>
```

**Step 4 — Verify formatting**

Only if `ts_files` is non-empty:
```
./node_modules/.bin/dprint check <ts_files...>
```
If this fails, show which files still need formatting and stop.

**Step 5 — Verify lint**

Only if `ts_files` is non-empty:
```
./node_modules/.bin/oxlint <ts_files...>
```
If this fails, show the remaining violations and stop.

**Step 6 — Verify CSS lint**

Only if `css_files` is non-empty:
```
./node_modules/.bin/stylelint <css_files...>
```
If this fails, show the remaining violations and stop.

## Output

- If all steps pass: report "Pre-commit checks passed."
- If a fix step fails: report the error output and which step failed, then stop.
- If a check step fails after fixing: show the remaining violations so the user can fix them manually.
