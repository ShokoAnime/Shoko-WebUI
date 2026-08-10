import type {
  FilterCondition,
  FilterExpression,
  GroupNode,
  LeafNode,
  LeafValue,
  TreeNode,
  UnsupportedNode,
} from '@/core/types/api/filter';

let fallbackIdCounter = 0;
export const generateNodeId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  fallbackIdCounter += 1;
  return `node-${fallbackIdCounter}`;
};

// Tag-style expressions have a bespoke editor (separate AniDB/user tag search endpoints,
// include/exclude UI) that can't be derived from catalog metadata alone — their possible
// values come from useAniDBTagsQuery/useUserTagsQuery, not the catalog's PossibleParameters.
const TAG_LIKE_EXPRESSIONS = new Set(['HasTag', 'HasCustomTag']);

// Single source of truth for widget selection, replacing the two independent hardcoded
// heuristics that used to live in Criteria.tsx and buildSidebarFilterCondition.
export const getWidgetKind = (entry: FilterExpression): 'boolean' | 'multi' | 'multiPair' | 'tag' => {
  if (TAG_LIKE_EXPRESSIONS.has(entry.Expression)) return 'tag';
  if (entry.PossibleParameterPairs) return 'multiPair';
  if (entry.PossibleParameters ?? entry.Parameter === 'Number') return 'multi';
  return 'boolean';
};

export const createLeafNode = (entry: FilterExpression): LeafNode => {
  const base = { id: generateNodeId(), kind: 'leaf' as const, expression: entry.Expression, negate: false };
  switch (getWidgetKind(entry)) {
    case 'tag':
      return { ...base, value: { kind: 'tag', tags: [] } };
    case 'multiPair':
      return { ...base, value: { kind: 'multiPair', values: [], match: 'Or' } };
    case 'multi':
      return { ...base, value: { kind: 'multi', values: [], match: 'Or' } };
    case 'boolean':
    default:
      return { ...base, value: { kind: 'boolean', value: true } };
  }
};

export const createEmptyGroupNode = (operator: 'And' | 'Or' = 'And'): GroupNode => ({
  id: generateNodeId(),
  kind: 'group',
  operator,
  negate: false,
  children: [],
});

const unsupported = (condition: FilterCondition): UnsupportedNode => ({
  id: generateNodeId(),
  kind: 'unsupported',
  raw: condition,
});

// Parses one atomic (non-And/Or) condition, unwrapping a single leading Not if present.
// Function calls and comparison operators over typed selectors (anything with a Left or
// Right slot per the catalog) are permanently out of scope for the editable widgets and
// become UnsupportedNode, preserved byte-for-byte.
const parseAtomicCondition = (condition: FilterCondition, catalog: FilterExpression[]): TreeNode => {
  const negated = condition.Type === 'Not';
  const inner = negated ? condition.Left : condition;
  if (!inner) return unsupported(condition);

  const entry = catalog.find(item => item.Expression === inner.Type);
  if (!entry || entry.Left || entry.Right) return unsupported(condition);

  const id = generateNodeId();
  switch (getWidgetKind(entry)) {
    case 'tag': {
      if (inner.Parameter === undefined) return unsupported(condition);
      return {
        id,
        kind: 'leaf',
        expression: inner.Type,
        negate: false,
        value: { kind: 'tag', tags: [{ Name: inner.Parameter, isExcluded: negated }] },
      };
    }
    case 'multiPair': {
      if (inner.Parameter === undefined || inner.SecondParameter === undefined) return unsupported(condition);
      return {
        id,
        kind: 'leaf',
        expression: inner.Type,
        negate: negated,
        value: { kind: 'multiPair', values: [[inner.Parameter, inner.SecondParameter]], match: 'Or' },
      };
    }
    case 'multi': {
      if (inner.Parameter === undefined) return unsupported(condition);
      return {
        id,
        kind: 'leaf',
        expression: inner.Type,
        negate: negated,
        value: { kind: 'multi', values: [inner.Parameter], match: 'Or' },
      };
    }
    case 'boolean':
    default:
      // Not is absorbed into the True/False value itself here, mirroring the existing
      // DefaultCriteria widget - a boolean leaf never needs its own negate chip.
      return { id, kind: 'leaf', expression: inner.Type, negate: false, value: { kind: 'boolean', value: !negated } };
  }
};

// Only leaves of the same expression AND the same mergeable value kind combine - and only
// when neither is itself negated, since a negated multi/multiPair value can't be folded
// into a shared value list without losing its per-value Not semantics.
const mergeKey = (node: TreeNode): string | null => {
  if (node.kind !== 'leaf') return null;
  if (node.value.kind === 'tag') return `tag:${node.expression}`;
  if ((node.value.kind === 'multi' || node.value.kind === 'multiPair') && !node.negate) {
    return `${node.value.kind}:${node.expression}`;
  }
  return null;
};

const mergeTwoLeaves = (first: LeafNode, second: LeafNode, operator: 'And' | 'Or'): LeafNode => {
  if (first.value.kind === 'tag' && second.value.kind === 'tag') {
    return { ...first, value: { kind: 'tag', tags: [...first.value.tags, ...second.value.tags] } };
  }
  if (first.value.kind === 'multi' && second.value.kind === 'multi') {
    return {
      ...first,
      value: { kind: 'multi', values: [...first.value.values, ...second.value.values], match: operator },
    };
  }
  if (first.value.kind === 'multiPair' && second.value.kind === 'multiPair') {
    return {
      ...first,
      value: { kind: 'multiPair', values: [...first.value.values, ...second.value.values], match: operator },
    };
  }
  return first;
};

// Folds sibling leaves of the same expression produced by chaining multiple values under
// one operator (e.g. HasTag('a') And HasTag('b')) back into the single multi-value widget
// row that produced them, instead of showing one row per value.
const mergeGroupChildren = (children: TreeNode[], operator: 'And' | 'Or'): TreeNode[] => {
  const merged: TreeNode[] = [];
  children.forEach((child) => {
    const key = mergeKey(child);
    const existingIndex = key === null ? -1 : merged.findIndex(item => mergeKey(item) === key);
    if (existingIndex === -1) {
      merged.push(child);
    } else {
      merged[existingIndex] = mergeTwoLeaves(merged[existingIndex] as LeafNode, child as LeafNode, operator);
    }
  });
  return merged;
};

// Self-recursive: `collect` (flattening a same-operator chain) closes over the outer
// `parseNode` binding, which is already fully assigned by the time `collect` is ever
// invoked (it only runs when parseNode itself is called) - this keeps the mutual
// recursion self-contained instead of two top-level consts forward-referencing each other.
const parseNode = (condition: FilterCondition, catalog: FilterExpression[]): TreeNode => {
  if (condition.Type === 'And' || condition.Type === 'Or') {
    if (!condition.Left || !condition.Right) return unsupported(condition);
    const { Type: operator } = condition;

    const collect = (node: FilterCondition): TreeNode[] => {
      if (node.Type === operator && node.Left && node.Right) {
        return [...collect(node.Left), ...collect(node.Right)];
      }
      return [parseNode(node, catalog)];
    };

    const children = mergeGroupChildren(collect(condition), operator);
    if (children.length === 1) return children[0];
    return { id: generateNodeId(), kind: 'group', operator, negate: false, children };
  }

  if (condition.Type === 'Not' && (condition.Left?.Type === 'And' || condition.Left?.Type === 'Or')) {
    const innerGroup = parseNode(condition.Left, catalog);
    if (innerGroup.kind === 'unsupported') return unsupported(condition);
    return { ...innerGroup, negate: !innerGroup.negate };
  }

  return parseAtomicCondition(condition, catalog);
};

// Total: always succeeds. The root of the tree is always a GroupNode (possibly with a
// single child) so Redux state has one uniform shape to render/mutate, even when the
// underlying preset's root isn't itself a plain And (e.g. a single-condition or Or-rooted
// preset gets wrapped as the sole child of an implicit top-level And container).
export const parseFilterTree = (
  condition: FilterCondition | undefined,
  catalog: FilterExpression[],
): GroupNode | null => {
  if (!condition) return null;

  const node = parseNode(condition, catalog);
  if (node.kind === 'group' && node.operator === 'And' && !node.negate) return node;
  return { id: generateNodeId(), kind: 'group', operator: 'And', negate: false, children: [node] };
};

const buildGroupChain = (conditions: FilterCondition[], operator: 'And' | 'Or'): FilterCondition => {
  if (conditions.length > 1) {
    return { Type: operator, Left: conditions[0], Right: buildGroupChain(conditions.slice(1), operator) };
  }
  return conditions[0];
};

const buildLeafValue = (expression: string, value: LeafValue): FilterCondition => {
  switch (value.kind) {
    case 'boolean':
      return value.value ? { Type: expression } : { Type: 'Not', Left: { Type: expression } };
    case 'multi':
      return buildGroupChain(value.values.map(param => ({ Type: expression, Parameter: param })), value.match);
    case 'multiPair':
      return buildGroupChain(
        value.values.map(([param, secondParam]) => ({
          Type: expression,
          Parameter: param,
          SecondParameter: secondParam,
        })),
        value.match,
      );
    case 'tag':
      return buildGroupChain(
        value.tags.map(tag => (
          tag.isExcluded
            ? { Type: 'Not', Left: { Type: expression, Parameter: tag.Name } }
            : { Type: expression, Parameter: tag.Name }
        )),
        'And',
      );
    default:
      return { Type: expression };
  }
};

const buildNode = (node: TreeNode): FilterCondition => {
  if (node.kind === 'unsupported') return node.raw;

  if (node.kind === 'group') {
    const built = buildGroupChain(node.children.map(buildNode), node.operator);
    return node.negate ? { Type: 'Not', Left: built } : built;
  }

  const built = buildLeafValue(node.expression, node.value);
  return node.negate ? { Type: 'Not', Left: built } : built;
};

// Inverse of parseFilterTree. A null/empty tree omits Expression entirely rather than
// sending an empty group, matching filters like the server's default "All" preset.
export const buildFilterTree = (node: GroupNode | null): FilterCondition | undefined => {
  if (!node || node.children.length === 0) return undefined;
  return buildNode(node);
};

// Shared tree-navigation helpers used by both the Redux slice (id-addressed mutations)
// and selectors (e.g. "which expressions are already used in this group").
export const findNodeById = (node: TreeNode, nodeId: string): TreeNode | null => {
  if (node.id === nodeId) return node;
  if (node.kind === 'group') {
    for (const child of node.children) {
      const found = findNodeById(child, nodeId);
      if (found) return found;
    }
  }
  return null;
};

export const findGroupById = (node: TreeNode, groupId: string): GroupNode | null => {
  const found = findNodeById(node, groupId);
  return found?.kind === 'group' ? found : null;
};

export const removeNodeById = (root: GroupNode, nodeId: string): void => {
  const index = root.children.findIndex(child => child.id === nodeId);
  if (index !== -1) {
    root.children.splice(index, 1);
    return;
  }
  root.children.forEach((child) => {
    if (child.kind === 'group') removeNodeById(child, nodeId);
  });
};
