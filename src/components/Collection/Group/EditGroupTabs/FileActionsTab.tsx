import React from 'react';

import Action from '@/components/Collection/Group/EditGroupTabs/Action';
import toast from '@/components/Toast';
import { useRelocateGroupFilesMutation } from '@/core/react-query/group/mutations';
import useIsFeatureSupported, { FeatureType } from '@/hooks/useIsFeatureSupported';

type Props = {
  groupId: number;
};

const FileActionsTab = ({ groupId }: Props) => {
  const { mutate: relocateGroupFiles } = useRelocateGroupFilesMutation(groupId);
  const showUnsupportedToast = () => {
    toast.error(`This feature require server version >= ${FeatureType.RelocateSeriesFiles}`);
  };

  return (
    <div className="flex h-[22rem] grow flex-col gap-y-4 overflow-y-auto">
      <Action
        name="Rename/Move Files"
        description="Rename/Move every file associated with the group."
        onClick={useIsFeatureSupported(FeatureType.RelocateSeriesFiles) ? relocateGroupFiles : showUnsupportedToast}
      />
    </div>
  );
};

export default FileActionsTab;
