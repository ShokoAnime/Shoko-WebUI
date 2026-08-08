# LinkFilesWithProviders

Top-level utility page at `/webui/utilities/link-with-providers`. Links files to release info using configured providers, or fetches existing release info for already-linked files.

## Entry Points

Files arrive via React Router `location.state.selectedRows` (`FileType[]`):

| Source | Path | Note |
|---|---|---|
| `UnrecognizedTab` | `/webui/utilities/unrecognized/files` | Multi-select, "Link With Providers (beta)" button |
| `UnrecognizedFiles` panel | Dashboard | Single-file, per-row button |
| `FileSearch` | `/webui/utilities/file-search` | "Edit Link" button, multi-select |

All sources navigate: `navigate('/webui/utilities/link-with-providers', { state: { selectedRows } })`.

## File Structure

```
src/pages/utilities/
  LinkFilesWithProviders.tsx     Page component + render + event handlers

src/hooks/utilities/
  useLinkWorkflow.ts             State machine: dispatch, guard sets, drive loop

src/core/utilities/
  releaseInfoHelpers.ts          Pure helpers: createLinksFromFiles, mergeReleaseInfo

src/components/Utilities/Unrecognized/LinkFilesWithProvider/
  LinkCard.tsx                    Per-link card (state-driven styling, selection)
  ProviderName.tsx               Status text per state
  Menu.tsx                       Action bar (Search, Edit, Submit, etc.)
  TitleOptions.tsx               Header counts (submitted/pending/total/selected)
  AutoSearchReleaseModal.tsx     Provider picker modal
```

## Key Types

```ts
type LinkStateType = 'pre-init' | 'init' | 'searching' | 'ready' | 'submitting' | 'submitted' | 'fetching';

type ManualLinkProviderType = { id: string; enabled: boolean };

type ManualLinkType = {
  id: number;
  file: FileType;
  providers: ManualLinkProviderType[];
  release: ReleaseInfoType;
  state: LinkStateType;
};
```

Each link's `state` field drives the entire workflow — the component never directly calls process handlers, only the drive loop dispatches based on current state.

## State Groups

Three constants replace repeated arrays across the component:

| Name | Values | Guards |
|---|---|---|
| `BUSY_STATES` | `searching, submitting, fetching` | Blocks removal; Escape cancels active work |
| `NOT_SELECTABLE_STATES` | `pre-init` + `BUSY_STATES` | Blocks select-all |
| `EDITABLE_STATES` | `ready, init` | Enables search, provider update |

## State Machine

The workflow is state-driven:

```mermaid
flowchart TD
    Start([Start]) --> Imported{file.Imported?}

    Imported -- Yes --> Fetching[fetching]
    Fetching --> FetchResult{Release info returned?}
    FetchResult -- Yes --> Ready[ready]
    FetchResult -- No or error --> Init[init]

    Imported -- No --> PreInit[pre-init]
    PreInit --> OfflineImporter{Offline Importer available?}
    OfflineImporter -- No --> Providers{Providers enabled?}
    OfflineImporter -- Yes --> Preview[Offline Importer preview]
    Preview -- Non-null result --> Providers
    Preview -- Error --> Providers
    Preview -- Null result --> PreInit

    Providers -- Yes --> Searching[searching]
    Providers -- No --> Init
    Init -- User enables providers and searches --> Searching

    Searching --> AutoPreview{AutoPreview result?}
    AutoPreview -- Data --> Ready
    AutoPreview -- Null or error --> Init

    Ready -- Submit selected link --> Submitting[submitting]
    Submitting -- Success --> Submitted[submitted]
    Submitting -- Error --> Ready
```

### State Reference

| State | UI | Meaning |
|---|---|---|
| `pre-init` | `opacity-65 cursor-wait` | Seeding metadata via Offline Importer |
| `init` | `text-warning` | Waiting for user to configure providers |
| `searching` | `animate-pulse cursor-wait` | AutoPreview in progress |
| `fetching` | `animate-pulse cursor-wait` | Fetching existing release info for already-linked files |
| `ready` | `cursor-pointer` | Awaiting user submission |
| `submitting` | `cursor-progress` | Submitting release info to server |
| `submitted` | — | Finished |

### Process Handlers

All handlers are `useEffectEvent` callbacks inside `useLinkWorkflow`. Each gates on a guard Set (`inFlight.current.*`) to prevent duplicate in-flight API calls, adds the link ID before calling, and normally removes it in `finally`.

### `processPreInit`

1. Checks if any provider is enabled
2. Looks up the "Offline Importer" provider by name via `providerMap`
3. If no Offline Importer exists → transitions directly to `searching` or `init`
4. Otherwise calls `GET ReleaseInfo/Provider/{id}/Preview/By-Release?id=match://<path>` to seed file metadata
5. On a non-null success: stores the seed release → `searching` or `init`
6. On error: → `searching` or `init`

If the preview returns null, the current implementation leaves the link in `pre-init` after clearing its guard.

**State outcome**: `hasProvidersEnabled ? 'searching' : 'init'`

### `processSearch`

1. Filters enabled providers from `link.providers`
2. If none enabled → bails (guard NOT cleared; stays `searching` until providers are added)
3. Calls `POST ReleaseInfo/File/{id}/AutoPreview?providerIDs=...`
4. On null result → `init`
5. On data → merges result via `mergeReleaseInfo(incoming, link.release)` → `ready`
6. On error → `init`

### `processSubmit`

Calls `POST ReleaseInfo/File/{id}` with `link.release` body. Success → `submitted`, error → `ready`.

### `processLinked`

1. Calls `GET ReleaseInfo/File/{id}` to fetch existing release info
2. On null (no existing release info) → `init`
3. On data → stores fetched release → `ready`
4. On error → `init`

### `cancelActiveWork`

Flips busy states back to idle when the user presses Escape: `submitting` → `ready`, `searching`/`fetching` → `init`. Does NOT clear guard Sets — in-flight API calls complete naturally, and their callbacks will overwrite state harmlessly.

## Helpers (`releaseInfoHelpers.ts`)

### `createLinksFromFiles(files, providers)`

Converts `FileType[]` into `Record<number, ManualLinkType>`:

1. Sorts files by the first accessible location's `RelativePath` (natural sort, case-insensitive, numeric, ignoring punctuation)
2. For each file, builds a seed `ReleaseInfoType`:
   - `OriginalFilename` from last path segment
   - `ProviderName: 'User'`, `Source: Unknown`
   - `FileSize`, `Hashes` from file
   - `Released` date from `MediaInfo.Encoded` or `file.Created`
3. Checks `file.Imported`:
   - **truthy** → `providers: []`, `state: 'fetching'` (will call GET ReleaseInfo)
   - **falsy** → `providers` from settings, `state: 'pre-init'`

### `mergeReleaseInfo(incoming, original)`

Merges AutoPreview result into the user's seed release. Preserves user-set fields (`Source`, `FileSize`, `OriginalFilename`, flags) via nullish coalescing, enforces `Version >= 1`, and appends `+User` to `ProviderName` if not already present.

## API Endpoints

| Endpoint | Method | Used by | Purpose |
|---|---|---|---|
| `ReleaseInfo/Provider` | GET | Component | Fetch available providers |
| `ReleaseInfo/Provider/{id}/Preview/By-Release?id=match://<path>` | GET | `processPreInit` | Seed metadata from Offline Importer |
| `ReleaseInfo/File/{id}/AutoPreview?providerIDs=...` | POST | `processSearch` | Search enabled providers |
| `ReleaseInfo/File/{id}` | GET | `processLinked` | Fetch existing release info |
| `ReleaseInfo/File/{id}` | POST | `processSubmit` | Submit release info |

## Supporting Components

- **`LinkCard`** — Per-link card. Border color reflects state (`submitted` → important, `searching`/`submitting` → primary, `ready` → warning). Click-to-select disabled for `NOT_SELECTABLE_STATES`.
- **`ProviderName`** — Status text per state (`"Retrieving existing release info..."` for `fetching`, etc.). Appends "(Edited by User)" when `ProviderName` contains `+User`.
- **`Menu`** — Action bar. "Search for Release Info" enables when any selected link is in `['ready', 'init', 'fetching']`. Hotkeys: `S` search, `E` edit, `A` select-all, `D` remove, `Q` submit.
- **`TitleOptions`** — Header showing `{submitted} / {submitted + pending} Submitted | {total} Files | {selected} Selected`. Only `ready` and `submitting` count as pending; `init`, `searching`, `fetching`, and `pre-init` do not.
