import { createSelector, createSlice } from '@reduxjs/toolkit';

import {
  createEmptyGroupNode,
  createLeafNode,
  findGroupById,
  findNodeById,
  removeNodeById,
} from '@/core/utilities/filterTree';

import type { RootState } from '@/core/store';
import type { FilterCondition, FilterExpression, GroupNode, LeafValue } from '@/core/types/api/filter';
import type { PayloadAction } from '@reduxjs/toolkit';

/*
Sidebar filter

tree - the editable AND/OR/NOT condition tree, id-addressed so the same expression can
appear more than once (e.g. two independent InYear conditions in different groups).
Always a single root GroupNode once anything has been added; null means no filter.

activeFilter - the FilterCondition actually sent to the server, derived from `tree` via
buildFilterTree() and cached here so Collection.tsx doesn't need to recompute/import the
tree utilities itself; null if the filter is inactive/empty.

editingFilterId - set when `tree` was populated by loading an existing saved preset for
editing (see Collection.tsx's Edit action), so the sidebar knows it's safe to offer
"Save Changes" against that specific preset rather than only "Save as new preset". Cleared
on resetFilter so stale/unrelated live-filter edits can never be silently PUT to a preset
they don't actually represent.
*/

type State = {
  activeFilter: FilterCondition | null;
  editingFilterId: number | null;
  tree: GroupNode | null;
};

const initialState: State = {
  activeFilter: null,
  editingFilterId: null,
  tree: null,
};

const collectionSlice = createSlice({
  name: 'collection',
  initialState,
  reducers: {
    setTree(sliceState, action: PayloadAction<GroupNode | null>) {
      sliceState.tree = action.payload;
    },
    resetFilter() {
      return initialState;
    },
    addLeaf(sliceState, action: PayloadAction<{ entry: FilterExpression, groupId?: string }>) {
      const { entry, groupId } = action.payload;
      const leaf = createLeafNode(entry);
      sliceState.tree ??= createEmptyGroupNode('And');
      const target = (groupId ? findGroupById(sliceState.tree, groupId) : null) ?? sliceState.tree;
      target.children.push(leaf);
    },
    addGroup(sliceState, action: PayloadAction<{ groupId?: string } | undefined>) {
      const groupId = action.payload?.groupId;
      const newGroup = createEmptyGroupNode('And');
      sliceState.tree ??= createEmptyGroupNode('And');
      const target = (groupId ? findGroupById(sliceState.tree, groupId) : null) ?? sliceState.tree;
      target.children.push(newGroup);
    },
    removeNode(sliceState, action: PayloadAction<string>) {
      if (!sliceState.tree) return;
      if (sliceState.tree.id === action.payload) {
        sliceState.tree = null;
        return;
      }
      removeNodeById(sliceState.tree, action.payload);
    },
    setGroupOperator(sliceState, action: PayloadAction<{ nodeId: string, operator: 'And' | 'Or' }>) {
      if (!sliceState.tree) return;
      const node = findNodeById(sliceState.tree, action.payload.nodeId);
      if (node?.kind === 'group') node.operator = action.payload.operator;
    },
    setNegate(sliceState, action: PayloadAction<{ negate: boolean, nodeId: string }>) {
      if (!sliceState.tree) return;
      const node = findNodeById(sliceState.tree, action.payload.nodeId);
      if (node && node.kind !== 'unsupported') node.negate = action.payload.negate;
    },
    updateLeafValue(sliceState, action: PayloadAction<{ nodeId: string, value: LeafValue }>) {
      if (!sliceState.tree) return;
      const node = findNodeById(sliceState.tree, action.payload.nodeId);
      if (node?.kind === 'leaf') node.value = action.payload.value;
    },
    setActiveFilter(sliceState, action: PayloadAction<FilterCondition | null>) {
      sliceState.activeFilter = action.payload;
    },
    setEditingFilterId(sliceState, action: PayloadAction<number | null>) {
      sliceState.editingFilterId = action.payload;
    },
  },
});

export const {
  addGroup,
  addLeaf,
  removeNode,
  resetFilter,
  setActiveFilter,
  setEditingFilterId,
  setGroupOperator,
  setNegate,
  setTree,
  updateLeafValue,
} = collectionSlice.actions;

export const selectFilterTree = (state: RootState) => state.collection.tree;

export const selectEditingFilterId = (state: RootState) => state.collection.editingFilterId;

export const selectNodeById = createSelector(
  [
    (state: RootState) => state.collection.tree,
    (_: RootState, nodeId: string) => nodeId,
  ],
  (tree, nodeId) => (tree ? findNodeById(tree, nodeId) : null),
);

export const selectHasEditableContent = createSelector(
  [(state: RootState) => state.collection.tree],
  tree => !!tree && tree.children.length > 0,
);

// Used by AddCriteriaModal to avoid offering an expression already present as a direct
// (non-nested) leaf of the group the user is adding to.
export const selectUsedExpressionsInGroup = createSelector(
  [
    (state: RootState) => state.collection.tree,
    (_: RootState, groupId: string) => groupId,
  ],
  (tree, groupId) => {
    if (!tree) return [];
    const group = tree.id === groupId ? tree : findGroupById(tree, groupId);
    if (!group) return [];
    return group.children.filter(child => child.kind === 'leaf').map(child => child.expression);
  },
);

export default collectionSlice.reducer;
