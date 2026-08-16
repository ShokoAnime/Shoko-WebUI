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
  useReleaseInfoForm.ts          Form state + touched-field tracking for the Edit Release Info modal

src/core/utilities/
  releaseInfoHelpers.ts          Pure helpers: createLinksFromFiles, mergeReleaseInfo; shared constants EDITABLE_STATES, AUTO_MATCH_EPISODE_ID
  auto-match-logic.ts            detectShow, findMostCommonShowName

src/core/types/utilities/
  link-files-with-providers.ts    ManualLinkType, ManualLinkProviderType, LinkStateType, CrossReferenceType, TouchableField

src/components/Utilities/Unrecognized/
  AnimeSelectPanel.tsx           Shared AniDB series search panel (modal + LinkFilesTab)

  LinkFilesWithProvider/
    LinkCard.tsx                 Per-link card (state-driven styling, selection)
    ProviderName.tsx             Status text per state
    Menu.tsx                     Action bar (Search, Edit, Submit, etc.)
    TitleOptions.tsx             Header counts (submitted/pending/total/selected)
    AutoSearchReleaseModal.tsx   Provider picker modal
    EditReleaseInfoModal.tsx     Edit release metadata for selected links
```

## Key Types

```ts
type LinkStateType = 'init' | 'searching' | 'ready' | 'submitting' | 'submitted' | 'fetching';

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

The Edit Release Info modal adds two shared types:

```ts
type CrossReferenceType = {
  seriesId: number;
  episodeId: number;
  episodes: AniDBEpisodeType[];
};

type TouchableField = 'Comment' | 'CrossReferences' | 'IsChaptered' | 'IsCreditless' | 'Source' | 'Version';
```

## State Groups

Two constants replace repeated arrays across the workflow. `EDITABLE_STATES` lives in `releaseInfoHelpers.ts` so `Menu` and the page share it; `BUSY_STATES` remains page-local.

| Name | Values | Guards |
|---|---|---|
| `BUSY_STATES` | `searching, submitting, fetching` | Blocks removal and select-all; Escape cancels active work |
| `EDITABLE_STATES` | `ready, init` | Enables search, provider update, and release info editing |

## State Machine

The workflow is state-driven:

```mermaid
flowchart TD
    Start([Start]) --> Imported{file.Imported?}

    Imported -- Yes --> Fetching[fetching]
    Fetching --> FetchResult{Release info returned?}
    FetchResult -- Yes --> Ready[ready]
    FetchResult -- No or error --> Init[init]

    Imported -- No --> Providers{Providers enabled?}

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
| `init` | `text-warning` | Waiting for user to configure providers |
| `searching` | `animate-pulse cursor-wait` | AutoPreview in progress |
| `fetching` | `animate-pulse cursor-wait` | Fetching existing release info for already-linked files |
| `ready` | `cursor-pointer` | Awaiting user submission |
| `submitting` | `cursor-progress` | Submitting release info to server |
| `submitted` | — | Finished |

### Process Handlers

All handlers are `useEffectEvent` callbacks inside `useLinkWorkflow`. Each gates on a guard Set (`inFlight.current.*`) to prevent duplicate in-flight API calls, adds the link ID before calling, and removes it in `finally`.

### `processSearch`

1. Filters enabled providers from `link.providers`
2. If none enabled → clears the guard and → `init`
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

1. Sorts files by `RelativePath` of the first accessible location (falling back to the first location) — natural, case-insensitive, numeric, ignoring punctuation
2. For each file, builds a seed `ReleaseInfoType`:
   - `OriginalFilename` from last path segment
   - `ProviderName: 'User'`, `Source: Unknown`
   - `FileSize`, `Hashes` from file
   - `Released` date from `MediaInfo.Encoded` or `file.Created`
3. Checks `file.Imported`:
   - **truthy** → `providers: []`, `state: 'fetching'` (will call GET ReleaseInfo)
   - **falsy** → `providers` from settings, `state: 'searching'` (if any provider is enabled) or `'init'`

### `mergeReleaseInfo(incoming, original)`

Merges AutoPreview result into the user's seed release. Preserves user-set fields via nullish coalescing (`FileSize`, `OriginalFilename`, `IsChaptered`, `IsCensored`, `IsCreditless`, `Group`), restores `Source` from the original only when the incoming `Source` is `Unknown`, enforces `Version >= 1`, and appends `+User` to `ProviderName` unless it is already `'User'` or already contains `+User`.

## API Endpoints

| Endpoint | Method | Used by | Purpose |
|---|---|---|---|
| `ReleaseInfo/Provider` | GET | Component | Fetch available providers |
| `ReleaseInfo/File/{id}/AutoPreview?providerIDs=...` | POST | `processSearch` | Search enabled providers |
| `ReleaseInfo/File/{id}` | GET | `processLinked` | Fetch existing release info |
| `ReleaseInfo/File/{id}` | POST | `processSubmit` | Submit release info |

## Edit Release Info Modal

Opened from the Menu's "Edit Release Info" action (`E`) for the selected links. Two-step flow:

1. **Series search** — a shared `AnimeSelectPanel` (debounced AniDB search) when no series is selected.
2. **Review form** — once a series is chosen (or when bulk-selecting mixed series), shows series + episode selection and the release fields.

Editable fields: `Version`, `Source`, `IsChaptered`, `IsCreditless`, and `Comment`. Episode selection includes an "Auto-match (from filename)" option (`AUTO_MATCH_EPISODE_ID = -1`). When selected files have differing episode links, the selector shows a disabled "Multiple episodes selected" entry and those per-file links are preserved unless an episode (or auto-match) is explicitly chosen. Save stays disabled until a field is touched.

State is managed by the `useReleaseInfoForm` hook (form state, touched-field tracking, mixed-selection flags). On save, `handleSaveReleaseInfo` in the page merges the patch into each selected link's `release`, resolves the episode cross-reference (auto-match resolves via `detectShow` → matching episode, writing `CrossReferences` at 0–100%), appends the `+User` marker to `ProviderName`, and sets the link state to `ready`. Links whose auto-match fails keep their previous state (no `ready` transition) and are reported in an error toast with the file count.

## Supporting Components

- **`LinkCard`** — Per-link card. Border color reflects state (`submitted` → important, `searching`/`submitting` → primary, `ready` → warning). Click-to-select disabled for busy states (`searching`/`submitting`/`fetching`).
- **`ProviderName`** — Status text per state (`"Retrieving existing release info..."` for `fetching`, etc.). Appends "(Edited by User)" when `ProviderName` starts with `User+` or ends with `+User`.
- **`Menu`** — Action bar. "Search for Release Info" and "Edit Release Info" enable when all selected links are in `EDITABLE_STATES` (`ready`/`init`); "Remove Selected" and "Submit Selected" render conditionally. The "Edit Release Info" button (`E`) opens the Edit Release Info modal. Hotkeys are registered on the page: `S` search, `A` select-all, `D` remove, `E` edit, `Q` submit, `Esc` cancel, `Enter` submit.
- **`TitleOptions`** — Header showing `{submitted} / {submitted + pending} Submitted | {total} Files | {selected} Selected`. Only `ready` and `submitting` count as pending; `init`, `searching`, and `fetching` do not.
