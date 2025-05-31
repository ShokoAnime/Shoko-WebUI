import React, { useLayoutEffect, useMemo, useState } from 'react';
import { mdiPencilCircleOutline, mdiPlusCircleOutline } from '@mdi/js';
import Icon from '@mdi/react';
import cx from 'classnames';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import ModalPanel from '@/components/Panels/ModalPanel';
import { invalidateQueries } from '@/core/react-query/queryClient';
import { useSeriesUserTagsSetQuery } from '@/core/react-query/series/queries';
import {
  useAddUserTagMutation,
  useCreateUserTagMutation,
  useDeleteUserTagMutation,
  useRemoveUserTagMutation,
  useUpdateUserTagMutation,
} from '@/core/react-query/tag/mutations';
import { useUserTagsQuery } from '@/core/react-query/tag/queries';
import useEventCallback from '@/hooks/useEventCallback';

export type Props = {
  seriesId: number;
  show: boolean;
  onClose: () => void;
};

const CustomTagModal = ({ onClose, seriesId, show }: Props) => {
  const userTagsQuery = useUserTagsQuery({ pageSize: 0, includeCount: true }, show);
  const activeTagSetQuery = useSeriesUserTagsSetQuery(seriesId, show);
  const { mutate: addUserTagMutation } = useAddUserTagMutation();
  const { mutate: removeUserTagMutation } = useRemoveUserTagMutation();
  const { mutate: createUserTagMutation } = useCreateUserTagMutation();
  const { mutate: updateTagMutation } = useUpdateUserTagMutation();
  const { mutate: deleteTagMutation } = useDeleteUserTagMutation();
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const selectedTag = useMemo(() => userTagsQuery.data?.find(tag => tag.ID === selectedTagId) ?? null, [
    userTagsQuery.data,
    selectedTagId,
  ]);
  const [mode, setMode] = useState<'create' | 'edit' | null>(null);
  const [tagName, setTagName] = useState('');
  const [tagDesc, setTagDescription] = useState('');

  const activeTagSet = activeTagSetQuery.data;
  const lockedControls = !mode || (mode === 'edit' && !selectedTag);
  const lockedTag = mode === 'create';
  const canCreate = mode === 'create' && tagName && tagName.length > 0;
  const changed = mode === 'edit' && selectedTag
    && (selectedTag.Name !== tagName || selectedTag.Description !== tagDesc);

  let subHeader = 'Add/Remove Tags';
  if (mode === 'edit') subHeader = 'Edit Tags';
  if (mode === 'create') subHeader = 'Create Tag';

  const handleTagNameChange = useEventCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (lockedControls) return;
    setTagName(event.target.value);
  });

  const handleTagDescChange = useEventCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (lockedControls) return;
    setTagDescription(event.target.value);
  });

  const handleTagClick = useEventCallback((event: React.MouseEvent<HTMLElement>) => {
    if (lockedTag) return;

    const selectedTagId1 = parseInt(event.currentTarget.dataset.tagId ?? '0', 10);
    if (Number.isNaN(selectedTagId1) || !selectedTagId1) return;
    const selectedTag1 = userTagsQuery.data?.find(tag => tag.ID === selectedTagId1) ?? null;
    if (selectedTag1 && selectedTag && selectedTag1.ID === selectedTag.ID) {
      setSelectedTagId(null);
      setTagName('');
      setTagDescription('');
    } else {
      setSelectedTagId(selectedTag1?.ID ?? null);
      setTagName(selectedTag1?.Name ?? '');
      setTagDescription(selectedTag1?.Description ?? '');
    }
  });

  const handleClose = useEventCallback(() => {
    setMode(null);
    setSelectedTagId(null);
    setTagName('');
    setTagDescription('');
    invalidateQueries(['series', seriesId, 'tags']);
    onClose();
  });

  const handleCancel = useEventCallback(() => {
    if (mode === 'create') {
      setMode(null);
      setSelectedTagId(null);
      setTagName('');
      setTagDescription('');
    } else if (mode === 'edit') {
      setMode(null);
      setTagName(selectedTag?.Name ?? '');
      setTagDescription(selectedTag?.Description ?? '');
    } else if (mode === 'remove') {
      setMode(null);
      setTagName(selectedTag?.Name ?? '');
      setTagDescription(selectedTag?.Description ?? '');
    } else if (selectedTag) {
      setSelectedTagId(null);
      setTagName('');
      setTagDescription('');
    } else {
      invalidateQueries(['series', seriesId, 'tags']);
      onClose();
    }
  });

  const handleDelete = useEventCallback(() => {
    if (!selectedTag) return;
    deleteTagMutation(selectedTag.ID, {
      onSuccess: () => {
        setMode(null);
        setSelectedTagId(null);
        setTagName('');
        setTagDescription('');
      },
    });
  });

  const handleSave = useEventCallback(() => {
    if (!selectedTag) return;
    updateTagMutation({ tagId: selectedTag.ID, name: tagName, description: tagDesc });
  });

  const handleCreate = useEventCallback(() => {
    createUserTagMutation({ name: tagName, description: tagDesc || null }, {
      onSuccess: (tag) => {
        setMode(null);
        setSelectedTagId(tag.ID);
        setTagName(tag.Name);
        setTagDescription(tag.Description ?? '');
        removeUserTagMutation({ seriesId, tagId: tag.ID });
      },
    });
  });

  const handleAdd = useEventCallback(() => {
    if (!selectedTag) return;
    addUserTagMutation({ seriesId, tagId: selectedTag.ID });
  });

  const handleRemove = useEventCallback(() => {
    if (!selectedTag) return;
    removeUserTagMutation({ seriesId, tagId: selectedTag.ID });
  });

  const handleEditModeToggle = useEventCallback(() => {
    setMode('edit');
    setTagName(selectedTag?.Name ?? '');
    setTagDescription(selectedTag?.Description ?? '');
  });

  const handleCreateModeToggle = useEventCallback(() => {
    setMode('create');
    setSelectedTagId(null);
    setTagName('');
    setTagDescription('');
  });

  const buttons = useMemo(() => {
    if (mode === 'create') {
      return (
        <>
          <Button key="add-cancel" onClick={handleCancel} buttonType="secondary" className="px-6 py-2">Cancel</Button>
          <Button
            key="add-confirm"
            onClick={handleCreate}
            buttonType="primary"
            disabled={!canCreate}
            className="px-6 py-2"
          >
            Create
          </Button>
        </>
      );
    }
    if (mode === 'edit') {
      return (
        <>
          <Button
            key="edit-delete"
            onClick={handleDelete}
            buttonType="secondary"
            disabled={!selectedTag}
            className="px-6 py-2"
          >
            Delete
          </Button>
          <Button key="edit-cancel" onClick={handleCancel} buttonType="secondary" className="px-6 py-2">Cancel</Button>
          <Button key="edit-save" onClick={handleSave} buttonType="primary" disabled={!changed} className="px-6 py-2">
            Save
          </Button>
        </>
      );
    }
    if (selectedTag && activeTagSet.has(selectedTag.ID)) {
      return (
        <>
          <Button key="remove-cancel" onClick={handleCancel} buttonType="secondary" className="px-6 py-2">
            Cancel
          </Button>
          <Button key="remove" onClick={handleRemove} buttonType="danger" disabled={!selectedTag} className="px-6 py-2">
            Remove
          </Button>
        </>
      );
    }
    if (selectedTag) {
      return (
        <>
          <Button key="add-cancel" onClick={handleCancel} buttonType="secondary" className="px-6 py-2">Cancel</Button>
          <Button key="add" onClick={handleAdd} buttonType="primary" disabled={!selectedTag} className="px-6 py-2">
            Add
          </Button>
        </>
      );
    }
    return <Button key="cancel" onClick={handleCancel} buttonType="secondary" className="px-6 py-2">Close</Button>;
  }, [
    activeTagSet,
    canCreate,
    changed,
    handleAdd,
    handleCancel,
    handleCreate,
    handleDelete,
    handleRemove,
    handleSave,
    mode,
    selectedTag,
  ]);

  useLayoutEffect(() => {
    if (show) {
      userTagsQuery.refetch().catch(console.error);
      activeTagSetQuery.refetch().catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, seriesId]);

  return (
    <ModalPanel
      show={show}
      onRequestClose={handleClose}
      header="Custom Tags"
      size="sm"
      overlayClassName="!z-[90]"
      subHeader={subHeader}
    >
      <div className="flex grow flex-col gap-y-2">
        <div className="flex justify-between">
          <div className="mb-2 font-semibold">
            Available Tags
          </div>
          <div className="flex gap-x-2">
            <Button onClick={handleEditModeToggle} disabled={!!mode} tooltip="Edit Tags">
              <Icon className="text-panel-icon-action" path={mdiPencilCircleOutline} size={1} />
            </Button>
            <Button onClick={handleCreateModeToggle} disabled={!!mode} tooltip="Create Tag">
              <Icon className="text-panel-icon-action" path={mdiPlusCircleOutline} size={1} />
            </Button>
          </div>
        </div>
        <div className="flex h-[10.5rem] flex-col overflow-y-auto rounded-md border border-panel-border bg-panel-background-alt px-4 py-2 contain-strict">
          {userTagsQuery.data?.map(tag => (
            <div
              key={tag.ID}
              data-tag-id={tag.ID}
              onClick={handleTagClick}
              className={cx(
                'flex flex-row justify-between',
                lockedTag && 'opacity-65',
                !lockedTag && 'cursor-pointer',
                !lockedTag && activeTagSet.has(tag.ID) && (!selectedTag || selectedTag.ID !== tag.ID)
                  && 'text-panel-text-primary',
                selectedTag?.ID === tag.ID && 'text-panel-text-important',
              )}
            >
              <span>
                {tag.Name}
              </span>
              <span className="w-10 text-center">
                {tag.Size ?? 0}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-2 font-semibold">
          Name
        </div>
        <Input
          id="tag-name"
          type="text"
          disabled={lockedControls}
          value={tagName}
          onChange={handleTagNameChange}
          className={cx(
            lockedControls && 'opacity-65',
          )}
        />
      </div>
      <div>
        <div className="mb-2 font-semibold">
          Description
        </div>
        <Input
          id="tag-desc"
          type="text"
          disabled={lockedControls}
          value={tagDesc}
          onChange={handleTagDescChange}
          className={cx(
            lockedControls && 'opacity-65',
          )}
        />
      </div>
      <div className="flex justify-end gap-x-3 font-semibold">
        {buttons}
      </div>
    </ModalPanel>
  );
};

export default CustomTagModal;
