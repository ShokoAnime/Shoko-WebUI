import { describe, expect, it } from 'vitest';

import {
  buildFilterTree,
  createEmptyGroupNode,
  createLeafNode,
  findGroupById,
  findNodeById,
  generateNodeId,
  getWidgetKind,
  parseFilterTree,
  removeNodeById,
} from '@/core/utilities/filterTree';

import type {
  FilterCondition,
  FilterExpression,
  GroupNode,
  LeafNode,
  LeafValue,
  TreeNode,
} from '@/core/types/api/filter';

// Node ids are generated per call (crypto.randomUUID when available), so every structural
// comparison strips `id` keys recursively and never asserts on concrete id values.
const stripIds = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(stripIds);
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => key !== 'id')
        .map(([key, item]) => [key, stripIds(item)]),
    );
  }
  return value;
};

const expectNodeId = (node: { id: string }) => {
  expect(typeof node.id).toBe('string');
  expect(node.id.length).toBeGreaterThan(0);
};

// Catalog fixtures mirror the REAL server catalog (GET /api/v3/Filter/Expressions):
// Expression is the class name minus its suffix, Group 'Info' is what the WebUI editor
// filters on, and parameter values are actual strings from a production Shoko.db3.
const makeEntry = (expression: string, overrides: Partial<FilterExpression> = {}): FilterExpression => ({
  Description: '',
  Expression: expression,
  Group: 'Info',
  Name: expression,
  Type: 'Expression',
  ...overrides,
});

const BOOLEAN_A = makeEntry('IsFavorite');
const BOOLEAN_B = makeEntry('HasUnwatchedEpisodes');
const HAS_WATCHED = makeEntry('HasWatchedEpisodes');
const HAS_TMDB = makeEntry('HasTmdbLink');
const HAS_TVDB = makeEntry('HasTvDBLink');
const HAS_MISSING = makeEntry('HasMissingEpisodesCollecting');
const TAG = makeEntry('HasTag', {
  Parameter: 'String',
  PossibleParameters: ['18 restricted', '4-koma manga', 'Space'],
});
// Server reality: HasCustomTag sends NO PossibleParameters (user tags are fetched separately).
const CUSTOM_TAG = makeEntry('HasCustomTag', { Parameter: 'String' });
const MULTI = makeEntry('HasAnimeType', {
  Parameter: 'String',
  PossibleParameters: ['Unknown', 'Movie', 'OVA', 'TV', 'TVSeries', 'TVSpecial'],
});
const MULTI_NUMBER = makeEntry('InYear', { Parameter: 'Number', PossibleParameters: ['1968', '1984', '1986'] });
const MULTI_OTHER = makeEntry('HasResolution', {
  Parameter: 'String',
  PossibleParameters: ['2160p', '1080p', '720p', '480p'],
});
// InSeason is the ONLY multiPair expression the server exposes.
const PAIR = makeEntry('InSeason', {
  Parameter: 'Number',
  PossibleParameterPairs: [['2010', 'Winter'], ['2023', 'Fall']],
  SecondParameter: 'String',
});
// Comparisons / logic ops carry Left/Right slot descriptors (expected selector TYPE names)
// in the catalog; the WebUI never edits them and parse turns them into UnsupportedNodes.
const DATE_GT = makeEntry('DateGreaterThanEquals', { Left: 'DateSelector', Right: 'DateSelector' });
const DATE_EQUALS = makeEntry('DateEquals', { Left: 'DateSelector', Right: 'DateSelector' });
const STRING_EQUALS = makeEntry('StringEquals', { Left: 'StringSelector', Right: 'String' });
const STRING_STARTS_WITH = makeEntry('StringStartsWith', { Left: 'StringSelector', Right: 'String' });
const XOR = makeEntry('Xor', { Left: 'Bool', Right: 'Bool' });
const EQUALS = makeEntry('Equals', { Left: 'Bool', Parameter: 'Bool', Right: 'Bool' });

const CATALOG = [
  BOOLEAN_A,
  BOOLEAN_B,
  HAS_WATCHED,
  HAS_TMDB,
  HAS_TVDB,
  HAS_MISSING,
  TAG,
  CUSTOM_TAG,
  MULTI,
  MULTI_NUMBER,
  MULTI_OTHER,
  PAIR,
  DATE_GT,
  DATE_EQUALS,
  STRING_EQUALS,
  STRING_STARTS_WITH,
  XOR,
  EQUALS,
];

// Server-shape condition builders (wire format: PascalCase Type/Left/Right/Parameter/SecondParameter).
const expr = (
  type: string,
  parameter?: string,
): FilterCondition => (parameter === undefined ? { Type: type } : { Parameter: parameter, Type: type });

const exprPair = (type: string, parameter: string, secondParameter: string): FilterCondition => ({
  Parameter: parameter,
  SecondParameter: secondParameter,
  Type: type,
});

const andCond = (left: FilterCondition, right: FilterCondition): FilterCondition => ({
  Left: left,
  Right: right,
  Type: 'And',
});
const orCond = (left: FilterCondition, right: FilterCondition): FilterCondition => ({
  Left: left,
  Right: right,
  Type: 'Or',
});
const notCond = (left: FilterCondition): FilterCondition => ({ Left: left, Type: 'Not' });

// Realistic unsupported conditions mirroring server functions/selectors. Nested selector
// children (AddedDate/Name/Today/...) are never parsed once the top-level type is rejected.
const stringEqualsName = (name: string): FilterCondition => ({
  Left: { Type: 'Name' },
  Right: { Parameter: name, Type: 'Constant' },
  Type: 'StringEquals',
});
const xorCond = (left: FilterCondition, right: FilterCondition): FilterCondition => ({
  Left: left,
  Right: right,
  Type: 'Xor',
});
// The "Newly Added Series" preset from the server's FilterPreset table, simplified to the
// essential Today/DateAdd/DateDiff/AddedDate nesting around DateGreaterThanEquals.
const NEWLY_ADDED: FilterCondition = {
  Left: { Type: 'AddedDate' },
  Right: {
    Left: { Type: 'Today' },
    Right: { Left: { Type: 'Today' }, Parameter: '-14', Type: 'DateAdd' },
    Type: 'DateDiff',
  },
  Type: 'DateGreaterThanEquals',
};

// Tree-node builders for direct buildFilterTree tests (real generated ids).
const makeLeaf = (expression: string, value: LeafValue, negate = false): LeafNode => ({
  expression,
  id: generateNodeId(),
  kind: 'leaf',
  negate,
  value,
});

const makeGroup = (operator: 'And' | 'Or', children: TreeNode[], negate = false): GroupNode => ({
  children,
  id: generateNodeId(),
  kind: 'group',
  negate,
  operator,
});

const boolValue = (value = true): LeafValue => ({ kind: 'boolean', value });

describe('getWidgetKind', () => {
  it('classifies tag expressions (HasTag, HasCustomTag) as tag', () => {
    expect(getWidgetKind(TAG)).toBe('tag');
    expect(getWidgetKind(CUSTOM_TAG)).toBe('tag');
  });

  it('classifies expressions with PossibleParameterPairs as multiPair', () => {
    expect(getWidgetKind(PAIR)).toBe('multiPair');
  });

  it('classifies multi-capable expressions as multi (via PossibleParameters or a Number Parameter)', () => {
    expect(getWidgetKind(MULTI)).toBe('multi');
    expect(getWidgetKind(MULTI_NUMBER)).toBe('multi');
    // Parameter: 'Number' alone (no PossibleParameters) also selects the multi widget.
    expect(getWidgetKind(makeEntry('InYear', { Parameter: 'Number' }))).toBe('multi');
  });

  it('classifies plain expressions as boolean', () => {
    expect(getWidgetKind(BOOLEAN_A)).toBe('boolean');
    expect(getWidgetKind(BOOLEAN_B)).toBe('boolean');
    // Slot-bearing comparisons classify as boolean here, but parse rejects them via
    // entry.Left/entry.Right before the widget kind is ever consulted.
    expect(getWidgetKind(DATE_GT)).toBe('boolean');
  });

  it('prefers tag over pair/multi markers (HasTag wins on a multi-capable entry)', () => {
    expect(getWidgetKind(makeEntry('HasTag', { PossibleParameterPairs: [['2010', 'Winter']] }))).toBe('tag');
  });

  it('prefers multiPair over multi when both markers are present', () => {
    expect(
      getWidgetKind(
        makeEntry('InSeason', { PossibleParameterPairs: [['2010', 'Winter']], PossibleParameters: ['TV'] }),
      ),
    )
      .toBe('multiPair');
  });
});

describe('createLeafNode', () => {
  it('creates an empty tag leaf for tag expressions', () => {
    const node = createLeafNode(TAG);
    expectNodeId(node);
    expect(stripIds(node)).toEqual({
      expression: 'HasTag',
      kind: 'leaf',
      negate: false,
      value: { kind: 'tag', tags: [] },
    });
  });

  it('creates an empty multiPair leaf defaulting to Or matching', () => {
    const node = createLeafNode(PAIR);
    expectNodeId(node);
    expect(stripIds(node)).toEqual({
      expression: 'InSeason',
      kind: 'leaf',
      negate: false,
      value: { kind: 'multiPair', match: 'Or', values: [] },
    });
  });

  it('creates an empty multi leaf defaulting to Or matching', () => {
    const node = createLeafNode(MULTI);
    expectNodeId(node);
    expect(stripIds(node)).toEqual({
      expression: 'HasAnimeType',
      kind: 'leaf',
      negate: false,
      value: { kind: 'multi', match: 'Or', values: [] },
    });
  });

  it('creates an empty multi leaf for Number-parameter expressions', () => {
    const node = createLeafNode(MULTI_NUMBER);
    expect(stripIds(node)).toEqual({
      expression: 'InYear',
      kind: 'leaf',
      negate: false,
      value: { kind: 'multi', match: 'Or', values: [] },
    });
  });

  it('creates a boolean leaf defaulting to true', () => {
    const node = createLeafNode(BOOLEAN_A);
    expectNodeId(node);
    expect(stripIds(node)).toEqual({
      expression: 'IsFavorite',
      kind: 'leaf',
      negate: false,
      value: { kind: 'boolean', value: true },
    });
  });
});

describe('createEmptyGroupNode', () => {
  it('defaults the operator to And', () => {
    const node = createEmptyGroupNode();
    expectNodeId(node);
    expect(stripIds(node)).toEqual({ children: [], kind: 'group', negate: false, operator: 'And' });
  });

  it('honours an explicit operator', () => {
    const node = createEmptyGroupNode('Or');
    expect(stripIds(node)).toEqual({ children: [], kind: 'group', negate: false, operator: 'Or' });
  });
});

describe('parseFilterTree', () => {
  describe('baseline shapes', () => {
    it('returns null for an undefined condition', () => {
      expect(parseFilterTree(undefined, CATALOG)).toBe(null);
    });

    it('wraps a single atomic expression in an implicit And root group', () => {
      const tree = parseFilterTree(expr('IsFavorite'), CATALOG);
      expectNodeId(tree!);
      expect(stripIds(tree)).toEqual({
        kind: 'group',
        operator: 'And',
        negate: false,
        children: [{ expression: 'IsFavorite', kind: 'leaf', negate: false, value: { kind: 'boolean', value: true } }],
      });
    });

    it('wraps an Or-rooted condition in an implicit And root group', () => {
      const tree = parseFilterTree(orCond(expr('IsFavorite'), expr('HasUnwatchedEpisodes')), CATALOG);
      expect(stripIds(tree)).toEqual({
        kind: 'group',
        operator: 'And',
        negate: false,
        children: [{
          kind: 'group',
          operator: 'Or',
          negate: false,
          children: [
            { expression: 'IsFavorite', kind: 'leaf', negate: false, value: { kind: 'boolean', value: true } },
            {
              expression: 'HasUnwatchedEpisodes',
              kind: 'leaf',
              negate: false,
              value: { kind: 'boolean', value: true },
            },
          ],
        }],
      });
    });

    it('returns an And-rooted condition as the root group without an extra wrap', () => {
      const condition = andCond(expr('IsFavorite'), orCond(expr('HasUnwatchedEpisodes'), expr('HasAnimeType', 'TV')));
      const tree = parseFilterTree(condition, CATALOG);
      expect(stripIds(tree)).toEqual({
        kind: 'group',
        operator: 'And',
        negate: false,
        children: [
          { expression: 'IsFavorite', kind: 'leaf', negate: false, value: { kind: 'boolean', value: true } },
          {
            kind: 'group',
            operator: 'Or',
            negate: false,
            children: [
              {
                expression: 'HasUnwatchedEpisodes',
                kind: 'leaf',
                negate: false,
                value: { kind: 'boolean', value: true },
              },
              {
                expression: 'HasAnimeType',
                kind: 'leaf',
                negate: false,
                value: { kind: 'multi', match: 'Or', values: ['TV'] },
              },
            ],
          },
        ],
      });
    });

    it('parses each widget kind from the catalog into its leaf value shape', () => {
      expect(stripIds(parseFilterTree(expr('IsFavorite'), CATALOG)!.children[0])).toEqual(
        { expression: 'IsFavorite', kind: 'leaf', negate: false, value: { kind: 'boolean', value: true } },
      );
      expect(stripIds(parseFilterTree(expr('HasTag', 'Space'), CATALOG)!.children[0])).toEqual(
        {
          expression: 'HasTag',
          kind: 'leaf',
          negate: false,
          value: { kind: 'tag', tags: [{ Name: 'Space', isExcluded: false }] },
        },
      );
      expect(stripIds(parseFilterTree(expr('HasAnimeType', 'TV'), CATALOG)!.children[0])).toEqual(
        {
          expression: 'HasAnimeType',
          kind: 'leaf',
          negate: false,
          value: { kind: 'multi', match: 'Or', values: ['TV'] },
        },
      );
      expect(stripIds(parseFilterTree(expr('InYear', '1984'), CATALOG)!.children[0])).toEqual(
        { expression: 'InYear', kind: 'leaf', negate: false, value: { kind: 'multi', match: 'Or', values: ['1984'] } },
      );
      expect(stripIds(parseFilterTree(exprPair('InSeason', '2010', 'Winter'), CATALOG)!.children[0])).toEqual(
        {
          expression: 'InSeason',
          kind: 'leaf',
          negate: false,
          value: { kind: 'multiPair', match: 'Or', values: [['2010', 'Winter']] },
        },
      );
    });

    it('stores scalar Parameter values verbatim in single-element lists (no list-string splitting)', () => {
      // The spec checklist mentions "list unwrapping", but the implementation treats
      // Parameter as an opaque scalar: a serialized-list string is stored as ONE value.
      const tree = parseFilterTree(expr('HasAnimeType', '["TV","Movie"]'), CATALOG);
      expect(stripIds(tree!.children[0])).toEqual({
        expression: 'HasAnimeType',
        kind: 'leaf',
        negate: false,
        value: { kind: 'multi', match: 'Or', values: ['["TV","Movie"]'] },
      });
    });
  });

  describe('negation', () => {
    it('represents Not over an And compound as a negate-toggled group', () => {
      const tree = parseFilterTree(notCond(andCond(expr('IsFavorite'), expr('HasUnwatchedEpisodes'))), CATALOG);
      expect(stripIds(tree)).toEqual({
        kind: 'group',
        operator: 'And',
        negate: false,
        children: [{
          kind: 'group',
          operator: 'And',
          negate: true,
          children: [
            { expression: 'IsFavorite', kind: 'leaf', negate: false, value: { kind: 'boolean', value: true } },
            {
              expression: 'HasUnwatchedEpisodes',
              kind: 'leaf',
              negate: false,
              value: { kind: 'boolean', value: true },
            },
          ],
        }],
      });
    });

    it('represents Not over an Or compound as a negate-toggled Or group', () => {
      const tree = parseFilterTree(notCond(orCond(expr('IsFavorite'), expr('HasUnwatchedEpisodes'))), CATALOG);
      expect(stripIds(tree)).toEqual({
        kind: 'group',
        operator: 'And',
        negate: false,
        children: [{
          kind: 'group',
          operator: 'Or',
          negate: true,
          children: [
            { expression: 'IsFavorite', kind: 'leaf', negate: false, value: { kind: 'boolean', value: true } },
            {
              expression: 'HasUnwatchedEpisodes',
              kind: 'leaf',
              negate: false,
              value: { kind: 'boolean', value: true },
            },
          ],
        }],
      });
    });

    it('absorbs Not over a tag expression into the tag list as isExcluded (node negate stays false)', () => {
      const tree = parseFilterTree(notCond(expr('HasTag', '18 restricted')), CATALOG);
      expect(stripIds(tree!.children[0])).toEqual({
        expression: 'HasTag',
        kind: 'leaf',
        negate: false,
        value: { kind: 'tag', tags: [{ Name: '18 restricted', isExcluded: true }] },
      });
    });

    it('absorbs Not over a multi expression into the leaf negate flag', () => {
      const tree = parseFilterTree(notCond(expr('HasAnimeType', 'TV')), CATALOG);
      expect(stripIds(tree!.children[0])).toEqual({
        expression: 'HasAnimeType',
        kind: 'leaf',
        negate: true,
        value: { kind: 'multi', match: 'Or', values: ['TV'] },
      });
    });

    it('absorbs Not over a multiPair expression into the leaf negate flag', () => {
      const tree = parseFilterTree(notCond(exprPair('InSeason', '2010', 'Winter')), CATALOG);
      expect(stripIds(tree!.children[0])).toEqual({
        expression: 'InSeason',
        kind: 'leaf',
        negate: true,
        value: { kind: 'multiPair', match: 'Or', values: [['2010', 'Winter']] },
      });
    });

    it('absorbs Not over a boolean expression into the boolean value (flip, never negate)', () => {
      const tree = parseFilterTree(notCond(expr('IsFavorite')), CATALOG);
      expect(stripIds(tree!.children[0])).toEqual({
        expression: 'IsFavorite',
        kind: 'leaf',
        negate: false,
        value: { kind: 'boolean', value: false },
      });
    });

    it('treats Not without a Left condition as unsupported, preserving the raw condition', () => {
      const condition: FilterCondition = { Type: 'Not' };
      const tree = parseFilterTree(condition, CATALOG);
      expect(stripIds(tree)).toEqual({
        kind: 'group',
        operator: 'And',
        negate: false,
        children: [{ kind: 'unsupported', raw: { Type: 'Not' } }],
      });
    });

    it('treats a double negation Not(Not(X)) as unsupported (only single-level Not is unwrapped)', () => {
      const condition = notCond(notCond(expr('IsFavorite')));
      const tree = parseFilterTree(condition, CATALOG);
      expect(stripIds(tree!.children[0])).toEqual({ kind: 'unsupported', raw: condition });
    });

    it('preserves the full Not wrapper as raw when Not over a malformed And becomes unsupported', () => {
      const malformed: FilterCondition = { Left: expr('IsFavorite'), Type: 'And' };
      const condition = notCond(malformed);
      const tree = parseFilterTree(condition, CATALOG);
      expect(stripIds(tree)).toEqual({
        kind: 'group',
        operator: 'And',
        negate: false,
        children: [{ kind: 'unsupported', raw: condition }],
      });
    });
  });

  describe('preservation of unsupported expressions', () => {
    it('preserves an expression the current catalog does not know (server-version skew) byte-for-byte', () => {
      // Older/newer servers may persist expression types absent from this catalog build.
      const condition = expr('MysteryExpression', 'x');
      const tree = parseFilterTree(condition, CATALOG);
      expect(stripIds(tree!.children[0])).toEqual({ kind: 'unsupported', raw: condition });
    });

    it('preserves catalog entries that define Left or Right slots (comparisons) as unsupported', () => {
      const condition = stringEqualsName('Space');
      const tree = parseFilterTree(condition, CATALOG);
      expect(stripIds(tree!.children[0])).toEqual({ kind: 'unsupported', raw: condition });
      const startsWith: FilterCondition = { Left: { Type: 'Name' }, Parameter: 'Star', Type: 'StringStartsWith' };
      expect(stripIds(parseFilterTree(startsWith, CATALOG)!.children[0])).toEqual({
        kind: 'unsupported',
        raw: startsWith,
      });
    });

    it('preserves a deep DateGreaterThanEquals function tree (Newly Added preset shape) byte-for-byte', () => {
      const tree = parseFilterTree(NEWLY_ADDED, CATALOG);
      expect(stripIds(tree!.children[0])).toEqual({ kind: 'unsupported', raw: NEWLY_ADDED });
    });

    it('preserves logic operators Xor and Equals (with Bool Parameter) as unsupported', () => {
      const xor = xorCond(expr('IsFavorite'), expr('HasUnwatchedEpisodes'));
      expect(stripIds(parseFilterTree(xor, CATALOG)!.children[0])).toEqual({ kind: 'unsupported', raw: xor });
      const equalsCond: FilterCondition = {
        Left: { Type: 'IsFavorite' },
        Parameter: 'true',
        Right: { Parameter: 'true', Type: 'Constant' },
        Type: 'Equals',
      };
      expect(stripIds(parseFilterTree(equalsCond, CATALOG)!.children[0])).toEqual({
        kind: 'unsupported',
        raw: equalsCond,
      });
    });

    it('preserves And/Or nodes that are missing a side as unsupported', () => {
      const condition: FilterCondition = { Left: expr('IsFavorite'), Type: 'And' };
      const tree = parseFilterTree(condition, CATALOG);
      expect(stripIds(tree)).toEqual({
        kind: 'group',
        operator: 'And',
        negate: false,
        children: [{ kind: 'unsupported', raw: condition }],
      });
    });

    it('preserves a malformed And nested inside a valid And chain as unsupported', () => {
      const malformed: FilterCondition = { Left: expr('IsFavorite'), Type: 'And' };
      const condition = andCond(expr('HasUnwatchedEpisodes'), malformed);
      const tree = parseFilterTree(condition, CATALOG);
      expect(stripIds(tree)).toEqual({
        kind: 'group',
        operator: 'And',
        negate: false,
        children: [
          { expression: 'HasUnwatchedEpisodes', kind: 'leaf', negate: false, value: { kind: 'boolean', value: true } },
          { kind: 'unsupported', raw: malformed },
        ],
      });
    });

    it('keeps unsupported nodes verbatim through a full parse -> build -> parse cycle', () => {
      const condition: FilterCondition = { Left: { Type: 'AddedDate' }, Right: { Type: 'Today' }, Type: 'DateEquals' };
      const firstTree = parseFilterTree(condition, CATALOG);
      const built = buildFilterTree(firstTree);
      expect(built).toEqual(condition);
      expect(stripIds(parseFilterTree(built, CATALOG))).toEqual(stripIds(firstTree));
    });

    it('supports mixing an unsupported node with editable leaves under And', () => {
      const comparison = stringEqualsName('Space');
      const condition = andCond(comparison, expr('IsFavorite'));
      const tree = parseFilterTree(condition, CATALOG);
      expect(stripIds(tree)).toEqual({
        kind: 'group',
        operator: 'And',
        negate: false,
        children: [
          { kind: 'unsupported', raw: comparison },
          { expression: 'IsFavorite', kind: 'leaf', negate: false, value: { kind: 'boolean', value: true } },
        ],
      });
      expect(buildFilterTree(tree)).toEqual(condition);
    });
  });

  describe('sibling folding and collapse', () => {
    it('folds two And-chained tag siblings of the same expression into one multi-tag leaf', () => {
      const condition = andCond(expr('HasTag', 'Space'), expr('HasTag', '4-koma manga'));
      const tree = parseFilterTree(condition, CATALOG);
      expect(stripIds(tree)).toEqual({
        kind: 'group',
        operator: 'And',
        negate: false,
        children: [{
          expression: 'HasTag',
          kind: 'leaf',
          negate: false,
          value: {
            kind: 'tag',
            tags: [{ Name: 'Space', isExcluded: false }, { Name: '4-koma manga', isExcluded: false }],
          },
        }],
      });
    });

    it('folds included and excluded tags together, keeping per-tag exclusion', () => {
      const condition = andCond(expr('HasTag', 'Space'), notCond(expr('HasTag', '18 restricted')));
      const tree = parseFilterTree(condition, CATALOG);
      expect(stripIds(tree!.children[0])).toEqual({
        expression: 'HasTag',
        kind: 'leaf',
        negate: false,
        value: {
          kind: 'tag',
          tags: [{ Name: 'Space', isExcluded: false }, { Name: '18 restricted', isExcluded: true }],
        },
      });
    });

    it('folds three chained tag siblings into one leaf', () => {
      const condition = andCond(
        expr('HasTag', 'Space'),
        andCond(expr('HasTag', '4-koma manga'), expr('HasTag', '18 restricted')),
      );
      const tree = parseFilterTree(condition, CATALOG);
      const child = tree!.children[0] as LeafNode;
      expect(child.kind).toBe('leaf');
      expect(child.value.kind === 'tag' && child.value.tags.map(tag => tag.Name)).toEqual([
        'Space',
        '4-koma manga',
        '18 restricted',
      ]);
    });

    it('folds same-expression multi siblings under And with the And match', () => {
      const tree = parseFilterTree(andCond(expr('HasAnimeType', 'TV'), expr('HasAnimeType', 'Movie')), CATALOG);
      expect(stripIds(tree!.children[0])).toEqual({
        expression: 'HasAnimeType',
        kind: 'leaf',
        negate: false,
        value: { kind: 'multi', match: 'And', values: ['TV', 'Movie'] },
      });
    });

    it('folds same-expression multi siblings under Or with the Or match', () => {
      const tree = parseFilterTree(orCond(expr('HasAnimeType', 'OVA'), expr('HasAnimeType', 'TV')), CATALOG);
      expect(stripIds(tree!.children[0])).toEqual({
        expression: 'HasAnimeType',
        kind: 'leaf',
        negate: false,
        value: { kind: 'multi', match: 'Or', values: ['OVA', 'TV'] },
      });
    });

    it('folds same-expression multiPair siblings', () => {
      const tree = parseFilterTree(
        orCond(exprPair('InSeason', '2010', 'Winter'), exprPair('InSeason', '2023', 'Fall')),
        CATALOG,
      );
      expect(stripIds(tree!.children[0])).toEqual({
        expression: 'InSeason',
        kind: 'leaf',
        negate: false,
        value: { kind: 'multiPair', match: 'Or', values: [['2010', 'Winter'], ['2023', 'Fall']] },
      });
    });

    it('does not fold negated multi siblings (per-value Not semantics are preserved)', () => {
      const tree = parseFilterTree(
        andCond(expr('HasAnimeType', 'TV'), notCond(expr('HasAnimeType', 'Movie'))),
        CATALOG,
      );
      expect(stripIds(tree!.children)).toEqual([
        {
          expression: 'HasAnimeType',
          kind: 'leaf',
          negate: false,
          value: { kind: 'multi', match: 'Or', values: ['TV'] },
        },
        {
          expression: 'HasAnimeType',
          kind: 'leaf',
          negate: true,
          value: { kind: 'multi', match: 'Or', values: ['Movie'] },
        },
      ]);
    });

    it('does not fold boolean siblings with the same expression', () => {
      const tree = parseFilterTree(andCond(expr('IsFavorite'), expr('IsFavorite')), CATALOG);
      expect(stripIds(tree!.children)).toEqual([
        { expression: 'IsFavorite', kind: 'leaf', negate: false, value: { kind: 'boolean', value: true } },
        { expression: 'IsFavorite', kind: 'leaf', negate: false, value: { kind: 'boolean', value: true } },
      ]);
    });

    it('does not fold multi siblings of different expressions', () => {
      const tree = parseFilterTree(andCond(expr('HasAnimeType', 'TV'), expr('InYear', '1968')), CATALOG);
      expect(tree!.children.length).toBe(2);
    });

    it('flattens same-operator And chains collected across nesting levels', () => {
      const condition = andCond(
        expr('IsFavorite'),
        andCond(expr('HasUnwatchedEpisodes'), andCond(expr('HasAnimeType', 'TV'), expr('HasResolution', '2160p'))),
      );
      const tree = parseFilterTree(condition, CATALOG);
      expect(tree!.children.length).toBe(4);
      expect(tree!.children.map(child => child.kind)).toEqual(['leaf', 'leaf', 'leaf', 'leaf']);
    });

    it('flattens same-operator Or chains across nesting levels', () => {
      const condition = orCond(
        expr('IsFavorite'),
        orCond(expr('HasUnwatchedEpisodes'), expr('HasCustomTag', 'watchlist')),
      );
      const tree = parseFilterTree(condition, CATALOG);
      const inner = tree!.children[0] as GroupNode;
      expect(inner.kind).toBe('group');
      expect(inner.operator).toBe('Or');
      expect(inner.children.length).toBe(3);
    });

    it('collapses a group down to a single node when folding leaves it with one child', () => {
      // And(HasTag a, HasTag b) folds to one leaf; the And group node itself disappears
      // and only the implicit And root added by parseFilterTree remains.
      const tree = parseFilterTree(andCond(expr('HasTag', 'Space'), expr('HasTag', '4-koma manga')), CATALOG);
      expect(tree!.children.length).toBe(1);
      expect(tree!.children[0].kind).toBe('leaf');
      const nested = parseFilterTree(
        andCond(expr('IsFavorite'), orCond(expr('HasAnimeType', 'OVA'), expr('HasAnimeType', 'TV'))),
        CATALOG,
      );
      const orChild = nested!.children[1] as LeafNode;
      expect(orChild.kind).toBe('leaf');
      expect(stripIds(orChild)).toEqual({
        expression: 'HasAnimeType',
        kind: 'leaf',
        negate: false,
        value: { kind: 'multi', match: 'Or', values: ['OVA', 'TV'] },
      });
    });

    it('keeps a different-operator nested group intact (no cross-boundary folding)', () => {
      // HasAnimeType appears on both sides of the group boundary but must NOT fold across
      // it: merging only ever happens between siblings inside the same group.
      const condition = andCond(expr('HasAnimeType', 'TV'), orCond(expr('HasAnimeType', 'Movie'), expr('IsFavorite')));
      const tree = parseFilterTree(condition, CATALOG);
      expect(stripIds(tree)).toEqual({
        kind: 'group',
        operator: 'And',
        negate: false,
        children: [
          {
            expression: 'HasAnimeType',
            kind: 'leaf',
            negate: false,
            value: { kind: 'multi', match: 'Or', values: ['TV'] },
          },
          {
            kind: 'group',
            operator: 'Or',
            negate: false,
            children: [
              {
                expression: 'HasAnimeType',
                kind: 'leaf',
                negate: false,
                value: { kind: 'multi', match: 'Or', values: ['Movie'] },
              },
              { expression: 'IsFavorite', kind: 'leaf', negate: false, value: { kind: 'boolean', value: true } },
            ],
          },
        ],
      });
    });

    it('folds tag siblings regardless of operator, so Or-joined tags rebuild as And (documented lossiness)', () => {
      const condition = orCond(expr('HasTag', 'Space'), expr('HasTag', '4-koma manga'));
      const tree = parseFilterTree(condition, CATALOG);
      expect(tree!.children.length).toBe(1);
      expect(buildFilterTree(tree)).toEqual(andCond(expr('HasTag', 'Space'), expr('HasTag', '4-koma manga')));
    });
  });
});

describe('buildFilterTree', () => {
  it('returns undefined for null, empty, and degenerate (only-empty-child) trees', () => {
    expect(buildFilterTree(null)).toBe(undefined);
    expect(buildFilterTree(createEmptyGroupNode())).toBe(undefined);
    expect(buildFilterTree(makeGroup('And', [makeGroup('Or', [])]))).toBe(undefined);
  });

  it('builds a negated group back to the server Not-with-Left form', () => {
    const tree = parseFilterTree(notCond(andCond(expr('IsFavorite'), expr('HasUnwatchedEpisodes'))), CATALOG);
    expect(buildFilterTree(tree)).toEqual({
      Left: {
        Left: { Type: 'IsFavorite' },
        Right: { Type: 'HasUnwatchedEpisodes' },
        Type: 'And',
      },
      Type: 'Not',
    });
  });

  it('chains group children into a right-leaning binary tree', () => {
    const tree = makeGroup('Or', [
      makeLeaf('IsFavorite', boolValue()),
      makeLeaf('HasUnwatchedEpisodes', boolValue()),
      makeLeaf('HasCustomTag', { kind: 'tag', tags: [{ Name: 'watchlist', isExcluded: false }] }),
    ]);
    expect(buildFilterTree(tree)).toEqual({
      Left: { Type: 'IsFavorite' },
      Right: {
        Left: { Type: 'HasUnwatchedEpisodes' },
        Right: { Parameter: 'watchlist', Type: 'HasCustomTag' },
        Type: 'Or',
      },
      Type: 'Or',
    });
  });

  it('builds a multi leaf with And matching into nested And conditions', () => {
    const tree = makeGroup('And', [makeLeaf('HasAnimeType', { kind: 'multi', match: 'And', values: ['TV', 'OVA'] })]);
    expect(buildFilterTree(tree)).toEqual(andCond(expr('HasAnimeType', 'TV'), expr('HasAnimeType', 'OVA')));
  });

  it('builds a multi leaf with Or matching into nested Or conditions', () => {
    const tree = makeGroup('And', [
      makeLeaf('HasResolution', { kind: 'multi', match: 'Or', values: ['2160p', '1080p', '720p'] }),
    ]);
    expect(buildFilterTree(tree)).toEqual(
      orCond(expr('HasResolution', '2160p'), orCond(expr('HasResolution', '1080p'), expr('HasResolution', '720p'))),
    );
  });

  it('builds a multiPair leaf into Parameter/SecondParameter conditions', () => {
    const tree = makeGroup('And', [
      makeLeaf('InSeason', { kind: 'multiPair', match: 'And', values: [['2010', 'Winter'], ['2023', 'Fall']] }),
    ]);
    expect(buildFilterTree(tree)).toEqual(
      andCond(exprPair('InSeason', '2010', 'Winter'), exprPair('InSeason', '2023', 'Fall')),
    );
  });

  it('builds excluded tag values into Not-wrapped conditions chained with And', () => {
    const tree = makeGroup('And', [
      makeLeaf('HasTag', {
        kind: 'tag',
        tags: [{ Name: 'Space', isExcluded: false }, { Name: '18 restricted', isExcluded: true }],
      }),
    ]);
    expect(buildFilterTree(tree)).toEqual(
      andCond(expr('HasTag', 'Space'), notCond(expr('HasTag', '18 restricted'))),
    );
  });

  it('wraps a negated leaf in Not around the built value chain', () => {
    const tree = makeGroup('And', [
      makeLeaf('HasAnimeType', { kind: 'multi', match: 'Or', values: ['TV', 'Movie'] }, true),
    ]);
    expect(buildFilterTree(tree)).toEqual({
      Left: orCond(expr('HasAnimeType', 'TV'), expr('HasAnimeType', 'Movie')),
      Type: 'Not',
    });
  });

  it('returns unsupported raw conditions unchanged', () => {
    const tree = makeGroup('And', [{ id: generateNodeId(), kind: 'unsupported', raw: NEWLY_ADDED }]);
    expect(buildFilterTree(tree)).toEqual(NEWLY_ADDED);
  });

  describe('round-trip stability (parse -> build applied twice)', () => {
    const roundTripCases: [string, FilterCondition][] = [
      ['single atomic boolean', expr('IsFavorite')],
      ['negated atomic boolean', notCond(expr('IsFavorite'))],
      ['single atomic tag', expr('HasTag', 'Space')],
      ['negated atomic tag', notCond(expr('HasTag', '18 restricted'))],
      ['single atomic multi', expr('HasAnimeType', 'TV')],
      ['negated atomic multi', notCond(expr('HasAnimeType', 'TV'))],
      ['single atomic multi with Number parameter', expr('InYear', '1984')],
      ['single atomic multiPair', exprPair('InSeason', '2010', 'Winter')],
      ['negated atomic multiPair', notCond(exprPair('InSeason', '2010', 'Winter'))],
      ['multi-leaf And', andCond(expr('IsFavorite'), expr('HasUnwatchedEpisodes'))],
      [
        'three-leaf right-leaning And',
        andCond(expr('IsFavorite'), andCond(expr('HasUnwatchedEpisodes'), expr('HasAnimeType', 'TV'))),
      ],
      ['multi-leaf Or', orCond(expr('IsFavorite'), expr('HasUnwatchedEpisodes'))],
      [
        'three-leaf Or chain',
        orCond(expr('IsFavorite'), orCond(expr('HasUnwatchedEpisodes'), expr('HasResolution', '2160p'))),
      ],
      ['negated And group', notCond(andCond(expr('IsFavorite'), expr('HasUnwatchedEpisodes')))],
      ['negated Or group', notCond(orCond(expr('IsFavorite'), expr('HasUnwatchedEpisodes')))],
      ['folded multi under And', andCond(expr('HasAnimeType', 'TV'), expr('HasAnimeType', 'OVA'))],
      ['folded multi under Or', orCond(expr('HasAnimeType', 'OVA'), expr('HasAnimeType', 'TV'))],
      [
        'folded multiPair under And',
        andCond(exprPair('InSeason', '2010', 'Winter'), exprPair('InSeason', '2023', 'Fall')),
      ],
      ['folded tags under And', andCond(expr('HasTag', 'Space'), expr('HasTag', '4-koma manga'))],
      [
        'mixed included/excluded tags under And',
        andCond(expr('HasTag', 'Space'), notCond(expr('HasTag', '18 restricted'))),
      ],
      [
        'folded tags under And with negated group',
        notCond(andCond(expr('HasTag', 'Space'), expr('HasTag', '4-koma manga'))),
      ],
      ['multi with one negated sibling', andCond(expr('HasAnimeType', 'TV'), notCond(expr('HasAnimeType', 'Movie')))],
      [
        'nested mixed-operator group',
        andCond(expr('IsFavorite'), orCond(expr('HasUnwatchedEpisodes'), expr('HasCustomTag', 'watchlist'))),
      ],
      ['unsupported expression (server-version skew)', expr('MysteryExpression', 'x')],
      ['StringEquals over Name (comparison slots)', stringEqualsName('Space')],
      ['Xor chain (unsupported logic op)', xorCond(expr('IsFavorite'), expr('HasUnwatchedEpisodes'))],
      ['malformed And missing Right', { Left: expr('IsFavorite'), Type: 'And' } satisfies FilterCondition],
    ];

    roundTripCases.forEach(([name, condition]) => {
      it(`round-trips ${name} identically, twice in a row`, () => {
        const once = buildFilterTree(parseFilterTree(condition, CATALOG));
        expect(once).toEqual(condition);
        const twice = buildFilterTree(parseFilterTree(once, CATALOG));
        expect(twice).toEqual(condition);
      });
    });
  });
});

describe('real server presets round-trip', () => {
  // Whole-tree fixtures copied from FilterPreset rows in a production Shoko.db3.
  const PRESETS: [string, FilterCondition][] = [
    ['Favorites', expr('IsFavorite')],
    ['Continue Watching', andCond(expr('HasWatchedEpisodes'), expr('HasUnwatchedEpisodes'))],
    ['TvDB/MovieDB Link Missing', notCond(orCond(expr('HasTvDBLink'), expr('HasTmdbLink')))],
    ['Missing Episodes', expr('HasMissingEpisodesCollecting')],
    ['Newly Added Series', NEWLY_ADDED],
  ];

  PRESETS.forEach(([name, condition]) => {
    it(`round-trips the "${name}" preset byte-for-byte, twice in a row`, () => {
      const once = buildFilterTree(parseFilterTree(condition, CATALOG));
      expect(once).toEqual(condition);
      const twice = buildFilterTree(parseFilterTree(once, CATALOG));
      expect(twice).toEqual(condition);
    });
  });

  it('parses the Favorites condition into the implicit-And wrap around a single boolean leaf', () => {
    const tree = parseFilterTree(expr('IsFavorite'), CATALOG);
    expect(stripIds(tree)).toEqual({
      kind: 'group',
      operator: 'And',
      negate: false,
      children: [{ expression: 'IsFavorite', kind: 'leaf', negate: false, value: { kind: 'boolean', value: true } }],
    });
    expect(buildFilterTree(tree)).toEqual({ Type: 'IsFavorite' });
  });

  it('parses Continue Watching into an And-rooted group of two boolean leaves', () => {
    const tree = parseFilterTree(andCond(expr('HasWatchedEpisodes'), expr('HasUnwatchedEpisodes')), CATALOG);
    expect(stripIds(tree)).toEqual({
      kind: 'group',
      operator: 'And',
      negate: false,
      children: [
        { expression: 'HasWatchedEpisodes', kind: 'leaf', negate: false, value: { kind: 'boolean', value: true } },
        { expression: 'HasUnwatchedEpisodes', kind: 'leaf', negate: false, value: { kind: 'boolean', value: true } },
      ],
    });
  });

  it('parses TvDB/MovieDB Link Missing into an implicit And root wrapping a negated Or group', () => {
    const tree = parseFilterTree(notCond(orCond(expr('HasTvDBLink'), expr('HasTmdbLink'))), CATALOG);
    expect(stripIds(tree)).toEqual({
      kind: 'group',
      operator: 'And',
      negate: false,
      children: [{
        kind: 'group',
        operator: 'Or',
        negate: true,
        children: [
          { expression: 'HasTvDBLink', kind: 'leaf', negate: false, value: { kind: 'boolean', value: true } },
          { expression: 'HasTmdbLink', kind: 'leaf', negate: false, value: { kind: 'boolean', value: true } },
        ],
      }],
    });
  });

  it('parses Newly Added Series into a single unsupported child preserving the full function tree', () => {
    const tree = parseFilterTree(NEWLY_ADDED, CATALOG);
    expect(stripIds(tree)).toEqual({
      kind: 'group',
      operator: 'And',
      negate: false,
      children: [{ kind: 'unsupported', raw: NEWLY_ADDED }],
    });
  });
});

describe('findNodeById', () => {
  const buildSampleTree = () => {
    const leafA = makeLeaf('IsFavorite', boolValue());
    const leafB = makeLeaf('HasUnwatchedEpisodes', boolValue());
    const leafC = makeLeaf('HasAnimeType', { kind: 'multi', match: 'Or', values: ['TV'] });
    const innerGroup = makeGroup('Or', [leafB, leafC]);
    const rootGroup = makeGroup('And', [leafA, innerGroup]);
    return { innerGroup, leafA, leafB, leafC, rootGroup };
  };

  it('finds the root node by its own id', () => {
    const { rootGroup } = buildSampleTree();
    expect(findNodeById(rootGroup, rootGroup.id)).toBe(rootGroup);
  });

  it('finds a direct child node', () => {
    const { leafA, rootGroup } = buildSampleTree();
    expect(findNodeById(rootGroup, leafA.id)).toBe(leafA);
  });

  it('finds a deeply nested node', () => {
    const { leafC, rootGroup } = buildSampleTree();
    expect(findNodeById(rootGroup, leafC.id)).toBe(leafC);
  });

  it('finds nested group nodes', () => {
    const { innerGroup, rootGroup } = buildSampleTree();
    expect(findNodeById(rootGroup, innerGroup.id)).toBe(innerGroup);
  });

  it('returns null when no node matches', () => {
    const { rootGroup } = buildSampleTree();
    expect(findNodeById(rootGroup, 'missing-id')).toBe(null);
  });
});

describe('findGroupById', () => {
  const buildSampleTree = () => {
    const leafA = makeLeaf('IsFavorite', boolValue());
    const innerGroup = makeGroup('Or', [makeLeaf('HasUnwatchedEpisodes', boolValue())]);
    const rootGroup = makeGroup('And', [leafA, innerGroup]);
    return { innerGroup, leafA, rootGroup };
  };

  it('finds the root group by id', () => {
    const { rootGroup } = buildSampleTree();
    expect(findGroupById(rootGroup, rootGroup.id)).toBe(rootGroup);
  });

  it('finds a nested group by id', () => {
    const { innerGroup, rootGroup } = buildSampleTree();
    expect(findGroupById(rootGroup, innerGroup.id)).toBe(innerGroup);
  });

  it('returns null when the id matches a leaf node', () => {
    const { leafA, rootGroup } = buildSampleTree();
    expect(findGroupById(rootGroup, leafA.id)).toBe(null);
  });

  it('returns null when the id matches nothing', () => {
    const { rootGroup } = buildSampleTree();
    expect(findGroupById(rootGroup, 'missing-id')).toBe(null);
  });
});

describe('removeNodeById', () => {
  const buildSampleTree = () => {
    const leafA = makeLeaf('IsFavorite', boolValue());
    const leafB = makeLeaf('HasUnwatchedEpisodes', boolValue());
    const leafC = makeLeaf('HasAnimeType', { kind: 'multi', match: 'Or', values: ['TV'] });
    const innerGroup = makeGroup('Or', [leafB, leafC]);
    const rootGroup = makeGroup('And', [leafA, innerGroup]);
    return { innerGroup, leafA, leafB, leafC, rootGroup };
  };

  it('returns void', () => {
    const { leafA, rootGroup } = buildSampleTree();
    expect(removeNodeById(rootGroup, leafA.id)).toBe(undefined);
  });

  it('removes a direct child, leaving the remaining tree structure intact', () => {
    const { innerGroup, leafA, rootGroup } = buildSampleTree();
    removeNodeById(rootGroup, leafA.id);
    expect(rootGroup.children).toEqual([innerGroup]);
    expect(stripIds(rootGroup)).toEqual({
      kind: 'group',
      negate: false,
      operator: 'And',
      children: [{
        kind: 'group',
        negate: false,
        operator: 'Or',
        children: [
          { expression: 'HasUnwatchedEpisodes', kind: 'leaf', negate: false, value: { kind: 'boolean', value: true } },
          {
            expression: 'HasAnimeType',
            kind: 'leaf',
            negate: false,
            value: { kind: 'multi', match: 'Or', values: ['TV'] },
          },
        ],
      }],
    });
  });

  it('removes a deeply nested node without corrupting its parent group', () => {
    const { innerGroup, leafB, leafC, rootGroup } = buildSampleTree();
    removeNodeById(rootGroup, leafC.id);
    expect(innerGroup.children).toEqual([leafB]);
    expect(rootGroup.children.length).toBe(2);
  });

  it('leaves the tree untouched when no node matches the id', () => {
    const { rootGroup } = buildSampleTree();
    const snapshot = structuredClone(rootGroup);
    removeNodeById(rootGroup, 'missing-id');
    expect(rootGroup).toEqual(snapshot);
  });

  it('does not remove the root by its own id (removal only scans children)', () => {
    const { rootGroup } = buildSampleTree();
    removeNodeById(rootGroup, rootGroup.id);
    expect(rootGroup.children.length).toBe(2);
  });

  it('removes unsupported nodes by id as well', () => {
    const unsupportedNode: TreeNode = { id: generateNodeId(), kind: 'unsupported', raw: stringEqualsName('Space') };
    const rootGroup = makeGroup('And', [makeLeaf('IsFavorite', boolValue()), unsupportedNode]);
    removeNodeById(rootGroup, unsupportedNode.id);
    expect(rootGroup.children.length).toBe(1);
    expect(rootGroup.children[0].kind).toBe('leaf');
  });
});
