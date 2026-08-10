import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { mdiContentSaveEditOutline, mdiContentSaveOutline } from '@mdi/js';

import FilterGroup from '@/components/Collection/Filter/FilterGroup';
import SavePresetModal from '@/components/Collection/Filter/SavePresetModal';
import Button from '@/components/Input/Button';
import IconButton from '@/components/Input/IconButton';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import { useUpdateFilterMutation } from '@/core/react-query/filter/mutations';
import { useAllFilterExpressionsQuery, useFilterQuery } from '@/core/react-query/filter/queries';
import {
  resetFilter,
  selectEditingFilterId,
  selectFilterTree,
  selectHasEditableContent,
  setActiveFilter,
  setEditingFilterId,
} from '@/core/slices/collection';
import { useDispatch, useSelector } from '@/core/store';
import toast from '@/core/toast';
import { buildFilterTree, createEmptyGroupNode } from '@/core/utilities/filterTree';
import useNavigateVoid from '@/hooks/useNavigateVoid';

type OptionsProps = {
  canSaveChanges: boolean;
  hasContent: boolean;
  isSavingChanges: boolean;
  onSaveChanges: () => void;
  showSavePresetModal: () => void;
};

const Options = ({ canSaveChanges, hasContent, isSavingChanges, onSaveChanges, showSavePresetModal }: OptionsProps) => (
  <div className="flex gap-2">
    {canSaveChanges && (
      <IconButton
        icon={mdiContentSaveEditOutline}
        buttonType="secondary"
        buttonSize="normal"
        onClick={onSaveChanges}
        tooltip="Save Changes"
        disabled={!hasContent || isSavingChanges}
      />
    )}
    <IconButton
      icon={mdiContentSaveOutline}
      buttonType="secondary"
      buttonSize="normal"
      onClick={showSavePresetModal}
      tooltip="Save as new preset"
      disabled={!hasContent}
    />
  </div>
);

const FilterSidebar = () => {
  const { filterId, groupId } = useParams();
  const [savePresetModal, showSavePresetModal] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigateVoid();

  const tree = useSelector(selectFilterTree);
  const editingFilterId = useSelector(selectEditingFilterId);
  const hasContent = useSelector(selectHasEditableContent);
  const catalog = useAllFilterExpressionsQuery().data ?? [];

  const editingFilterQuery = useFilterQuery(editingFilterId ?? 0, !!editingFilterId);
  const { isPending: isSavingChanges, mutate: updateFilter } = useUpdateFilterMutation();

  // Only offer "Save Changes" while actually on the live editing buffer - every entry
  // point that starts a fresh/unrelated live filter (Clear Filter, quick-filter jumps,
  // opening the sidebar with no filterId) dispatches resetFilter() first, which clears
  // editingFilterId, so this can't point at a preset the current buffer doesn't represent.
  const canSaveChanges = !!editingFilterId && filterId === 'live';

  useEffect(() => {
    dispatch(setActiveFilter(buildFilterTree(tree) ?? null));
  }, [dispatch, tree]);

  const handleSaveChanges = () => {
    if (!editingFilterId || !editingFilterQuery.data) return;
    const { IDs, IsLocked: _IsLocked, Size: _Size, ...body } = editingFilterQuery.data;
    updateFilter({
      filterId: editingFilterId,
      filter: { ...body, ParentID: IDs.ParentFilter ?? undefined, Expression: buildFilterTree(tree) },
    }, {
      onSuccess: () => {
        toast.success('Preset updated!');
        // Saving commits the edit and returns to the normal preset view. Only the "which
        // preset am I editing" marker is cleared here, not the tree itself - the tree
        // still accurately reflects what was just saved, so the sidebar (if left open)
        // keeps showing the right conditions instead of going blank.
        dispatch(setEditingFilterId(null));
        navigate(
          groupId
            ? `/webui/collection/group/${groupId}/filter/${editingFilterId}`
            : `/webui/collection/filter/${editingFilterId}`,
        );
      },
      onError: () => toast.error('Failed to update preset!'),
    });
  };

  const rootNode = tree ?? createEmptyGroupNode('And');
  const title = canSaveChanges && editingFilterQuery.data?.Name
    ? `Filter - Editing "${editingFilterQuery.data.Name}"`
    : 'Filter';

  return (
    <ShokoPanel
      title={title}
      className="sticky top-24 ml-6 h-[calc(100vh-18rem)]! w-full"
      contentClassName="gap-y-6"
      options={
        <Options
          canSaveChanges={canSaveChanges}
          hasContent={hasContent}
          isSavingChanges={isSavingChanges}
          onSaveChanges={handleSaveChanges}
          showSavePresetModal={() => showSavePresetModal(true)}
        />
      }
    >
      <FilterGroup catalog={catalog} node={rootNode} isRoot />
      <Button
        buttonType="danger"
        className="px-4 py-3"
        onClick={() => dispatch(resetFilter())}
      >
        Clear Filter
      </Button>
      <SavePresetModal
        show={savePresetModal}
        onClose={() => showSavePresetModal(false)}
        filterCondition={buildFilterTree(tree)}
      />
    </ShokoPanel>
  );
};

export default FilterSidebar;
