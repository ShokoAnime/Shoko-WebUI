# Collection Filter System

Developer-level specification for the Collection filter builder
(`src/components/Collection/Filter/`) and its supporting layers
(`src/core/utilities/filterTree.ts`, `src/core/slices/collection.ts`,
`src/core/react-query/filter/`). Covers the data model, the bidirectional
conversion between the server's expression tree and the editable UI state, and
how to extend the system to support additional server expression types.

This document describes the *current, shipped* implementation, not a design
proposal. Where something is intentionally unsupported, that's called out
explicitly along with why.

## 1. Server contract

The Shoko Server backend exposes collection filters as a generic binary
expression tree. The relevant API v3 shapes (`Shoko.Server/API/v3/Models/Shoko/Filter.cs`)
are:

```csharp
class FilterCondition {
    string Type;              // e.g. "And", "Not", "HasTag", "InYear"
    FilterCondition? Left;
    FilterCondition? Right;
    string? Parameter;
    string? SecondParameter;
}
```

A `Filter` (saved preset) carries an optional `Expression: FilterCondition` (no
`Expression` at all means "match everything") plus `Name`, `Sorting`,
`IsDirectory`, `IsHidden`, `ApplyAtSeriesLevel`, and parent/ID fields.

The server also exposes a **self-describing catalog** via
`GET /api/v3/Filter/Expressions`, returning one entry per known expression
type:

```csharp
class FilterExpressionHelp {
    string Expression;   // wire type name, e.g. "HasTag", "NumberGreaterThan"
    string Name;
    string Description;
    string Group;         // "Info" | "Logic" | "Function" | "Selector"
    string Type;           // this expression's own return type, e.g. "Expression" (bool),
                            // "NumberSelector", "DateSelector", "StringSelector", "StringSetSelector"
    string? Left;          // required type of the Left slot, if this expression has one
    string? Right;         // required type of the Right slot, if this expression has one
    string? Parameter;     // required type of the constant Parameter slot, if any
    string? SecondParameter;
    string[]? PossibleParameters;       // live-computed valid values, e.g. all known tags/years
    string[]? PossibleSecondParameters;
    string[][]? PossibleParameterPairs; // e.g. [year, season] pairs for InSeason
}
```

**`Group` has exactly four values** (`Shoko.Abstractions/Filtering/Expressions/FilterExpressionGroup.cs`):
`Info`, `Logic`, `Function`, `Selector`. It defaults to `Info` on the base
`FilterExpression<T>` class and is only overridden by combinators/comparisons
(`Logic`), `Today`/`DateAdd`/`DateDiff` (`Function`), and the ~106 leaf
value-getters like `EpisodeCountSelector` (`Selector`). Notably, **every
predicate under the C# `Info/`, `Files/`, and `User/` source folders reports
`Group: "Info"`** — the folder is a source-organization convenience, not the
wire-level group. There is no "Files" or "User" `Group` value; don't assume
one when reading older design notes.

Full details on the server side, including the concrete expression catalog
and known serialization quirks, live in `Shoko.Server/Filters/readme.md` and
are summarized in §7 below.

## 2. WebUI data model

`src/core/types/api/filter.ts` mirrors the wire DTOs (`FilterCondition`,
`FilterExpression`, `SortingCriteria`, `CreateOrUpdateFilterType`, `FilterType`)
and additionally defines the **editable UI tree**:

```ts
type LeafValue =
  | { kind: 'boolean'; value: boolean }
  | { kind: 'multi'; values: string[]; match: 'And' | 'Or' }
  | { kind: 'multiPair'; values: [string, string][]; match: 'And' | 'Or' }
  | { kind: 'tag'; tags: FilterTag[] }; // FilterTag = { Name: string; isExcluded: boolean }

type LeafNode = { id: string; kind: 'leaf'; expression: string; negate: boolean; value: LeafValue };
type GroupNode = { id: string; kind: 'group'; operator: 'And' | 'Or'; negate: boolean; children: TreeNode[] };
type UnsupportedNode = { id: string; kind: 'unsupported'; raw: FilterCondition };
type TreeNode = LeafNode | GroupNode | UnsupportedNode;
```

Redux (`src/core/slices/collection.ts`, slice `collection`) holds `tree:
GroupNode | null` as the single source of truth for the sidebar. The root is
always either `null` (no filter) or a `GroupNode` — never a bare `LeafNode` —
so every consumer can rely on one shape. Nodes are addressed by generated
`id` (`crypto.randomUUID()`, see `generateNodeId` in `filterTree.ts`), not by
expression name, so the same expression can legitimately appear more than
once in the tree (two independent `InYear` conditions in different branches,
for example) — something the old flat, map-by-expression-name model could
not represent.

`UnsupportedNode.raw` holds the **original, untouched `FilterCondition`
subtree** for anything the editable widgets can't represent. It is never
partially interpreted — building the tree back into a `FilterCondition`
returns `raw` byte-for-byte.

## 3. Bidirectional conversion (`src/core/utilities/filterTree.ts`)

### `getWidgetKind(entry: FilterExpression): 'boolean' | 'multi' | 'multiPair' | 'tag'`

The single source of truth for how a catalog entry maps to a leaf widget:

1. `HasTag` / `HasCustomTag` → `'tag'` (hardcoded by name — see §6, this is the
   one place expression identity is checked directly instead of shape,
   because their value source is a separate tag-search API, not
   `PossibleParameters`).
2. Has `PossibleParameterPairs` → `'multiPair'`.
3. Has `PossibleParameters`, or `Parameter === 'Number'` → `'multi'`.
4. Otherwise → `'boolean'`.

### `parseFilterTree(condition, catalog): GroupNode | null`

Total — always succeeds, never throws. Recursively walks the `FilterCondition`
tree:

- `And` / `Or` nodes recursively flatten same-operator chains into one
  `GroupNode` (so a right-leaning `And(a, And(b, And(c, d)))` becomes one
  4-child group, not 3 nested ones).
- `Not(And(...)|Or(...))` negates the resulting `GroupNode` in place
  (`negate: true`) rather than wrapping it opaquely — this is what lets
  `Not(Or(HasTvDBLink, HasTmdbLink))` round-trip as an editable negated `Or`
  group instead of becoming unsupported.
- `Not(<leaf>)` is absorbed directly into the leaf: boolean leaves flip their
  `value.value`; tag leaves set `isExcluded` per-tag; multi/multiPair leaves
  set `negate: true` on the leaf itself.
- Sibling leaves of the *same expression* produced by chaining multiple
  values under one operator (e.g. `HasTag('a') And HasTag('b')`, or
  `Or(InYear(2020), InYear(2021))`) are merged back into **one** multi-value
  widget row instead of showing one row per value (`mergeGroupChildren`).
  Merging is skipped for a negated multi/multiPair leaf, since a per-value
  `Not` can't be folded into a shared value list without losing its meaning.
- Anything else — a leaf whose catalog entry has a `Left` or `Right` slot
  (comparison operators, `Function` calls plumbed with `Selector`s), or an
  expression not found in the catalog at all — becomes an `UnsupportedNode`,
  and recursion stops there.
- If the root condition isn't itself a plain `And`, it's wrapped as the sole
  child of an implicit top-level `And` `GroupNode` so Redux state always has
  one shape (see §2).

### `buildFilterTree(node: GroupNode | null): FilterCondition | undefined`

The inverse, and much simpler since it's not trying to recover a "natural"
shape: `null`/empty tree → `undefined` (omit `Expression` from the request
entirely). Groups build a right-leaning `And`/`Or` chain over their built
children (wrapped in `Not` if negated). Leaves expand back into one
`FilterCondition` per multi/tag value, chained by the leaf's own `match`
operator. `UnsupportedNode` returns `raw` unchanged.

**Note:** `buildFilterTree` does not attempt to preserve the original tree's
exact nesting shape — AND is associative, so a left-leaning input tree may
come back right-leaning after a round trip. This is semantically identical
and matches how the pre-tree-rewrite flat builder already behaved; only
`UnsupportedNode` subtrees are preserved byte-for-byte.

## 4. Component architecture

```
FilterSidebar.tsx          — panel shell: title, Save/Save Changes/Clear Filter, renders root FilterGroup
  FilterGroup.tsx           — recursive: renders one GroupNode's chrome + children + Add controls
    FilterGroup.tsx          (nested groups recurse into themselves)
    FilterLeaf.tsx           — dispatches a LeafNode to the right widget by `value.kind`
      DefaultCriteria.tsx      — boolean toggle (True/False)
      MultiValueCriteria.tsx   — multi/multiPair display row → MultiValueCriteriaModal.tsx
      TagCriteria.tsx          — tag display row → TagCriteriaModal.tsx
      Criteria.tsx             — shared card chrome (name, NOT toggle, edit/remove icons,
                                  modal launcher) used by MultiValueCriteria/TagCriteria
    UnsupportedCondition.tsx — read-only card, remove-only
  AddCriteriaModal.tsx      — "add condition to this group" (per-group instance)
NotToggle.tsx               — shared NOT button (leaf + group headers)
SavePresetModal.tsx         — "Save as new preset" (create only; unchanged by this system)
```

Leaf widgets read/write a specific `LeafNode` by `id` via the slice's
`updateLeafValue`/`setNegate` actions — they do not know about the tree
structure around them.

## 5. Progressive disclosure

The sidebar looks and behaves exactly like a flat AND list until there's a
reason not to:

- A `GroupNode`'s header chrome (Match ALL/ANY dropdown, NOT toggle) is
  hidden when `isRoot && operator === 'And' && !negate` — i.e. the root of a
  plain AND tree, which is all "+ Add condition" alone ever produces.
- Chrome reappears automatically the moment it's load-bearing: a loaded
  preset whose root is actually `Or` and/or negated shows it immediately
  (never silently misrepresented), and any nested group (added via
  "+ Add group") always shows its own chrome, since choosing to nest is
  itself the deliberate advanced action.
- Per-row NOT is a real `Button` (blue when active, not red — red reads as
  disabled/error rather than "toggled on"; see `NotToggle.tsx`), available on
  every leaf that isn't boolean/tag-kind (see §3) and every group.

## 6. Scope boundaries — what's supported and why

Only expressions whose catalog entry has **no `Left`/`Right` slot** (a plain
boolean predicate, optionally with a single constant `Parameter` or a
`Parameter`+`SecondParameter` pair) are representable as an editable leaf.
Concretely, that means:

- ✅ Everything in `Group: "Info"` that takes 0–2 constant parameters — the
  majority of real-world filters (`HasTag`, `InYear`, `IsFinished`,
  `HasAudioLanguage`, `IsFavorite`, `InSeason`, etc.), regardless of which C#
  source folder (`Info/`, `Files/`, `User/`) they live in (see §1 — they all
  report `Group: "Info"`).
- ❌ `Group: "Logic"` comparison operators (`NumberGreaterThan`,
  `StringContains`, `DateGreaterThanEquals`, ...) and `Group: "Function"`
  calls (`Today`, `DateAdd`, `DateDiff`) — these plumb `Selector`s or other
  expressions into `Left`/`Right` instead of taking a constant `Parameter`.
- ❌ `Group: "Selector"` entries on their own — they're value-getters
  (`EpisodeCountSelector`, `LastWatchedDate`, ...), not boolean predicates;
  they only make sense as the `Left`/`Right` of a `Logic`/`Function`
  expression, which is itself unsupported.

**This is a deliberate, standing product boundary, not a temporary gap.**
The filter sidebar was originally kept as a flat AND-only list because a full
expression tree felt too complex for the actual (non-programmer) user base;
the tree rewrite added AND/OR/NOT grouping because real usage needed it
(confirmed by the shipped default filters), but exposing `DateDiff`-style
comparison logic was explicitly ruled out even for that follow-up — it's
considered hard to reason about even for programmers, let alone the target
audience. `UnsupportedCondition.tsx`'s copy ("uses advanced logic that can't
be edited here") is intentionally worded to not imply this is coming later.
Any change here needs a product decision, not just an engineering one.

Unsupported subtrees are always preserved verbatim (`UnsupportedNode.raw`) —
editing part of a preset can never silently corrupt a part built by another
tool or hand-crafted against the API directly.

## 7. Known wire-format quirks

- **`': '`-joined parameter pairs**: fixed in this system. `LeafValue.multiPair`
  carries real `[string, string]` tuples end-to-end; the join only happens
  transiently inside `MultiValueCriteriaModal` to build a display string for
  its option list (matched back against the catalog's original pair, not
  re-split, so a value containing `': '` can't be misinterpreted).
- **`StringSet`-typed `Parameter` values** (`IWithStringSetParameter`, e.g.
  `StringInExpression`, `SetOverlapsExpression`): the server serializes these
  by joining with `|||` but deserializes by stripping the first and last
  character of the parameter string before splitting
  (`Shoko.Server/API/v3/Helpers/FilterFactory.cs`, `GetExpressionTree`) — an
  apparent server-side bug/quirk. None of the currently-supported leaf kinds
  (§6) hit this path today. If you add support for a `StringSet`-parameter
  expression, verify the actual wire round-trip against a running server
  before shipping — it's undocumented and not covered by any test.

## 8. Adding support for a new expression

### 8a. A new simple `Info`-group expression — no frontend change needed

If the server adds a new `Group: "Info"` expression with 0–2 constant
`Parameter`s (optionally with `PossibleParameters`/`PossibleParameterPairs`),
it becomes usable automatically: `getWidgetKind` classifies it by shape, the
catalog fetch (`useFilterExpressionsQuery` / `useAllFilterExpressionsQuery`,
`src/core/react-query/filter/queries.ts`) already returns it, and
`AddCriteriaModal` already lists every `Group: "Info"` entry
(`transformFilterExpressions`, `src/core/react-query/filter/helpers.ts`). No
code changes required.

The one exception is `'tag'`-kind widgets: they're hardcoded to `HasTag` /
`HasCustomTag` by name (`TAG_LIKE_EXPRESSIONS` in `filterTree.ts`) because
their value source is a dedicated search endpoint
(`useAniDBTagsQuery`/`useUserTagsQuery`), not `PossibleParameters`. A new
tag-like expression with its own bespoke value source would need its own
name added to that set, its own query hook, and its own branch in
`TagCriteriaModal.tsx` (which currently branches on
`catalogEntry.Expression === 'HasTag'` to choose the AniDB vs. user tag
query).

### 8b. Widening visibility beyond `Group: "Info"`

Not currently needed in practice — see §1/§6, everything simple enough for
the current widgets already reports `Group: "Info"`. If a future server
change puts a simple, no-`Left`/`Right` expression under `Logic`/`Function`/
`Selector` for some reason, widen the filter in
`transformFilterExpressions` (`helpers.ts`) — it's a one-line change
(`item.Group === 'Info'` → whatever's needed), and `parseFilterTree` already
accepts the *full*, unfiltered catalog (via `useAllFilterExpressionsQuery`),
so previously-unrecognized-but-shape-compatible leaves in an existing preset
would already parse as editable even without this change — only the "Add
condition" dropdown is currently scoped to `Info`.

### 8c. A comparison/Function expression (e.g. `DateDiff`) — architecture extension

This is **not implemented and not currently planned** (§6) — treat the
following as a design sketch for if/when product direction changes, not a
todo.

An expression like `DateGreaterThanEquals(Left: DateSelector, Right:
DateSelector | Parameter)` doesn't fit the current `LeafValue` shapes at all:
it needs to hold a nested sub-expression (a `Selector`), not just a flat
constant. Supporting it end-to-end would require:

1. **A new `LeafValue` kind** capable of holding a `Left`/`Right` pair of
   nested `TreeNode`s (or a dedicated smaller structure just for
   selector-comparison expressions, if scoping this to only a few known
   comparison shapes rather than the fully generic case).
2. **Extending `getWidgetKind`** to recognize the new shape — e.g. a
   `'comparison'` kind for entries whose `Left`/`Right` types are
   `*Selector` — and to classify the `Selector`-group entries themselves (a
   `DateSelector` like `Today`/`LastWatchedDate`/`DateAdd` needs its own
   pickable identity and, for `DateAdd`, its own `TimeSpan` parameter input).
3. **Extending `parseAtomicCondition`** (or adding a parallel parse branch)
   to recurse into `Left`/`Right` instead of rejecting any entry that has
   them — this is the check at `filterTree.ts`: `if (!entry || entry.Left ||
   entry.Right) return unsupported(condition);`. The recursive parse needs
   its own termination rule for selector chains (e.g. `DateDiff(DateAdd(Today,
   ...), ...)` is itself a `Function` composed of other `Function`/`Selector`
   nodes) — decide how deep to support before falling back to
   `UnsupportedNode` again.
4. **Extending `buildLeafValue`** to reconstruct the nested `Left`/`Right`
   `FilterCondition` from the new `LeafValue` shape.
5. **A new leaf widget** (e.g. `DateComparisonCriteria.tsx` +
   `DateComparisonCriteriaModal.tsx`) following the existing card + edit-modal
   pattern (§4), with real UI controls for: picking the comparison operator,
   picking/building the `Left` selector chain, and entering constant
   operands (a duration input for `TimeSpan` parameters, etc.).
6. **Registering the new kind** in `FilterLeaf.tsx`'s dispatch switch.
7. Deciding whether/how to surface it in `AddCriteriaModal` given it's
   `Group: "Logic"`/`"Function"`, not `"Info"` (see §8b).

Steps 1–4 are a meaningful data-model and parser change, not a leaf-widget
add — plan for it as such, and get explicit product sign-off first (§6).
