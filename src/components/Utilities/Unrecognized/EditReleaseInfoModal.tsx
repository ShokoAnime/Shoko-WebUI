import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { cloneDeep } from 'lodash';
import { useDebounceValue } from 'usehooks-ts';

import Button from '@/components/Input/Button';
import ModalPanel from '@/components/Panels/ModalPanel';
import useKeyboardBindings from '@/hooks/useKeyboardBindings';

import type { ReleaseInfoType } from '@/core/types/api/file';

type EditReleasesModalProps = {
  show: boolean;
  releases: Record<number, ReleaseInfoType>;
  onClose: () => void;
  onUpdateReleases: (providers: Record<number, ReleaseInfoType>) => void;
};

const EditReleaseInfoModal = (props: EditReleasesModalProps): React.JSX.Element => {
  const { onClose, onUpdateReleases, releases: initialReleases, show } = props;
  const [releases, setReleases] = useState(() => cloneDeep(initialReleases));
  const releaseOrder = useMemo(() => Object.keys(releases).map(Number).sort((idA, idB) => idA - idB), [releases]);
  const canSave = useMemo(() => JSON.stringify(releases) !== JSON.stringify(initialReleases), [
    releases,
    initialReleases,
  ]);
  const [debouncedCanSave] = useDebounceValue(canSave, 100);

  const handleSave = useCallback(() => {
    if (!canSave) return;
    onUpdateReleases(releases);
    onClose();
  }, [canSave, onClose, onUpdateReleases, releases]);

  useKeyboardBindings(show, { Escape: onClose, Enter: handleSave });

  useEffect(() => {
    setReleases(cloneDeep(initialReleases));
  }, [initialReleases]);

  return (
    <ModalPanel
      show={releaseOrder.length > 0 && show}
      size="sm"
      onRequestClose={onClose}
      shouldCloseOnEsc={false}
      header="Edit Release Info"
    >
      <div className="flex flex-col gap-y-2">
        TODO
      </div>
      <div className="flex justify-end gap-x-3 font-semibold">
        <Button onClick={onClose} buttonType="secondary" className="px-5 py-2">Cancel</Button>
        <Button onClick={handleSave} buttonType="primary" className="px-5 py-2" disabled={!debouncedCanSave}>
          Save
        </Button>
      </div>
    </ModalPanel>
  );
};

export default EditReleaseInfoModal;
