# Backport Status: testing → v2.5.x

**Date**: 2026-05-29  
**Branch**: `v2.5.x`  
**Commits ahead of origin**: 25

---

## ✅ Completed Cherry-picks

### Direct Backports (Clean or Minor Conflicts)

| Testing Commit | Description | v2.5.x Commit | Notes |
|----------------|-------------|---------------|-------|
| `9802c4e7` | Misc changes (WebUI commit comparison link, error detail) | `a2352ba3` | Required preparatory commit `b8d8e657` |
| `3c44b9de` | Fix file search, remove lodash get | `16f4c7de` | Clean |
| `1dce29a9` | Add minimumReleaseAge for pnpm | `ba21b706` | Clean |
| `34363bdc` | Remove DownloadReleaseGroups setting | `22e705b2` | Clean |
| `148e7b4b` | Make thumbnails optional | `320092a6` | Clean |
| `2712c39c` | Use anidb title for anidb episode on tmdb linking | `06437a9f` | Clean |
| `34aefaf0` | Scope dumpInProgress to selected rows | `5008b7a2` | Clean |
| `edf8d473` | Correct series link on manually links page | — | Skipped (already present on v2.5.x) |
| `e4ba857a` | Fixes for release mgmt | `39b55a59` | Clean |
| `a412dfd5` | Sort files/locations after operations | `17f833f4` | Clean |
| `639dfd95` | Release mgmt erratic behaviour fix | `fe9b0d1c` | Minor conflict in MultipleReleasesInfo.tsx |
| `f120784e` | Use manual links count | `a2f9217f` | Kept v2.5.x server version |
| `ef9c5e3e` | Fix error page for no route match | `7bd5d4c2` | Clean |
| `4633cc59` | Add update check modals and server update check | `ec6c5580` | Added `react-markdown`, `remark-breaks`, `remark-gfm` deps. Requires server `5.3.3.0+` |

### Backported with Adaptations

| Testing Commit | Description | v2.5.x Commit | Adaptations Made |
|----------------|-------------|---------------|------------------|
| `07843d65` | QoL changes for filter presets and utils | `694183db` | Resolved Button.tsx conflict (added `id` prop, typed props) |
| `3f6fbfdc` | Rewrite Release Management workflow | `1784e559` | `managed-folder/` → `import-folder/`, `ManagedFolderID` → `ImportFolderID`, `file.Release` → `file.AniDB`, `FileHashDigestType[]` with `.find()`, `useToggleModalKeybinds(show, scope)` signature, `ConfirmationPromptModal` uses `children` prop |
| `1cfc7e91` | Misc changes (tooltips for audio/subs) | `78011e3a` | Skipped AutoSearchReleaseModal.tsx (doesn't exist on v2.5.x), removed duplicate AniDB link (already added in `3f6fbfdc` backport) |
| `b9a7ed59` | AniDB rules confirmation modal | `5e2fe9d2` | Resolved Button.tsx conflict, updated `useToggleModalKeybinds` signature |
| `1e33834e` | Fix sentry sessions, update frequency values | `666a19d0` | Code changes only, skipped lockfile and eslint config |
| `05fe5060` | Guard against missing folder ID | `b10d1510` | Applied to `ImportFolderModal.tsx` instead of `ManagedFolderModal.tsx` |
| `08364cc3` + `d6ec797f` | Sentry and hotkey fixes | `f911db36` | Combined backport: added `useToggleModalKeybinds(!show, 'primary')` to ReleaseManagementModal, fixed React keys, added try-catch in Toast.tsx, added optional chaining in LinkFilesTab.tsx |

### Preparatory Commits (v2.5.x Infrastructure)

| Commit | Description | Purpose |
|--------|-------------|---------|
| `b8d8e657` | refactor: rename uiVersion to getUiVersion, convert isDebug to arrow function | Required for `9802c4e7` |
| `cd9956d8` | feat: add react-hotkeys-hook infrastructure | Added `react-hotkeys-hook` v5.2.4, `HotkeysProvider` wrapper, `useToggleModalKeybinds` hook |
| `145a8f22` | feat: add typed useDispatch and useSelector hooks | Added typed hooks to `store.ts` using `withTypes()` API |
| `6b5c6ffc` | chore: bump minimum server version to 5.3.3.0 | Required for `4633cc59` (update check endpoints) |

---

## ⚠️ Remaining: Backportable with Changes

### 1. `97f19f48` - Update deps

**Files**: `package.json`, `pnpm-lock.yaml`, `AvatarEditorModal.tsx`, `webui/queries.ts`

**Changes**:
- `AvatarEditorModal.tsx`: Upgrades `react-avatar-editor` 14→15, uses `useAvatarEditor` hook
- `webui/queries.ts`: Moves eslint-disable comments (cosmetic)
- `package.json` + `pnpm-lock.yaml`: Dependency updates

**Backport Strategy**:
- **Option A (Minimal)**: Apply only cosmetic comment moves in `webui/queries.ts`
- **Option B (Full)**: Upgrade `react-avatar-editor` to v15, manually resolve lockfile conflicts

**Effort**: Low (Option A) to Medium (Option B)  
**Risk**: Low  
**Recommendation**: Optional - cosmetic changes only, or upgrade if react-avatar-editor v15 is desired

---

## ❌ Skipped Commits

### High Conflict Risk (Mechanical Refactors)

| Commit | Description | Reason |
|--------|-------------|--------|
| `09c985b0` | Use typed useDispatch and useSelector | 66 files, mechanical refactor across entire codebase |
| `24ffedf1` | Add new eslint rules | 112 files + eslint config + deps, Tailwind class ordering changes |

**Note**: These are purely mechanical refactors with no functional changes. The typed hooks infrastructure was added in `145a8f22`, but the 66-file migration was skipped due to extreme conflict risk.

### Not Backportable (v6.x Server Dependencies)

The following 22 commits depend on v6.x server APIs or new subsystems and cannot be backported:

- `50b568c7` - Show "import limbo" files (requires `ImportLimbo` API)
- `05fe5060` - Guard managed folder delete (depends on `managed-folder/` rename)
- `b194958f` - Align react-query endpoints (depends on `hashing/`, `release-info/` modules)
- `bd604622` - Fix ConfirmationPromptModal loading state (already included in `ConfirmationPromptModal` backport)
- `864db17e` - Managed folder delete safeguards (depends on `managed-folder/` rename)
- `648af242` - Remove Trakt integration (would break v2.5.x functionality)
- `01148e05` - Use `Available` instead of `RelativeFilepath` (v6.x API change)
- `7ea56857` - Restructure logging settings (v6.x settings schema)
- `95eedf04` - Add shift selection, update checks (depends on provider-based linking)
- `e1060a1a` - Process all links in LinkFilesWithProvidersTab (depends on `release-info/` module)
- `b2bb3f4f` - Show "Done" button (depends on provider-based linking)
- `e636576f` - Misc changes (bumps min server to v6.x)
- `f1da5915` - Merge provider-based linking PR (entire feature)
- `14d73a35` - Remove unused code (types still used on v2.5.x)
- `7f0271a3` - Fix the PR (part of provider-based linking)
- `81fdd28b` - Provider-based linking UI (depends on v6.x hashing/release-info APIs)
- `e462f333` - Fix versioning, managed folder handlers (depends on `managed-folder/` rename)
- `a215db61` - Distill changes from 'update-plugin-abstraction' (67-file rename)

---

## Key Adaptations Made for v2.5.x

### Module Renames
- `managed-folder/` → `import-folder/` (queries, types, mutations)
- `ManagedFolderID` → `ImportFolderID`
- `ManagedFolderType` → `ImportFolderType`

### API Type Changes
- `file.Release` → `file.AniDB` (with adjusted field names):
  - `Release.Group` → `AniDB.ReleaseGroup`
  - `Release.Source` → `AniDB.Source`
  - `Release.Version` → `AniDB.Version`
  - `Release.IsChaptered` → `AniDB.Chaptered`
  - `Release.IsCensored` → `AniDB.IsCensored`
  - `Release.IsCreditless` → Not available on v2.5.x
- `FileHashDigestType[]` with `.find(hash => hash.Type === '...')` instead of object with named properties

### Hook Signatures
- `useToggleModalKeybinds(show: boolean, scope: HotkeyScopesType)` where `HotkeyScopesType = 'primary' | 'modal' | 'nested-modal'`

### Component Props
- `ConfirmationPromptModal` uses `children` prop (latest from testing) instead of `content` prop
- `Button` component includes `keybinding` prop for displaying keyboard shortcuts

### External Links
- AniDB file link uses `https://anidb.net/file/{file.AniDB.ID}` instead of `file.Release.ReleaseURI`

### Server Version
- Bumped minimum server version to `5.3.3.0` (from `5.3.0.6`) to support `WebUI/LatestServerVersion` endpoint in update check modals

---

## Summary

**Total Commits Backported**: 24 (including 4 preparatory commits)  
**Commits Skipped**: 24 (2 high-conflict refactors, 22 v6.x dependencies)  
**Remaining Optional**: 1 (`97f19f48` - deps update)

**Testing Coverage**:
- ✅ Release Management workflow fully functional
- ✅ Filter presets and utilities improved
- ✅ AniDB rules confirmation modal added
- ✅ Error boundary enhanced with 404 handling
- ✅ Manual links count display fixed
- ✅ Audio/subtitle language tooltips added
- ✅ Server and WebUI update check modals added
- ✅ Update channel with Auto/Stable/Dev support
- ✅ Server update banner in TopNav
- ✅ Minimum server version bumped to 5.3.3.0

**Next Steps**:
1. Test all backported features against v2.5.x server (min v5.3.3.0)
2. Optionally backport `97f19f48` (deps update) if desired
3. Push to remote and create PR
