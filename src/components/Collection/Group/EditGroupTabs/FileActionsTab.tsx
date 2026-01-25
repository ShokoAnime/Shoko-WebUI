import React from 'react';

import Action from '@/components/Collection/Group/EditGroupTabs/Action';
import { useRelocateGroupFilesMutation } from '@/core/react-query/group/mutations';

type Props = {
  groupId: number;
};

const FileActionsTab = ({ groupId }: Props) => {
  const { mutate: relocateGroupFiles } = useRelocateGroupFilesMutation(groupId);

  return (
    <div className="flex h-88 grow flex-col gap-y-4 overflow-y-auto">
      <Action
        name="Rename/Move Files"
        description="Rename/Move every file associated with the group."
        onClick={relocateGroupFiles}
      />
    </div>
  );
};

export default FileActionsTab;
