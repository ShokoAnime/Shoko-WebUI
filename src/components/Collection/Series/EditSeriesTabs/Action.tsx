import React from 'react';
import { mdiPlayCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';

import Button from '@/components/Input/Button';

const Action = ({ description, name, onClick }: { name: string, description: string, onClick: () => void }) => (
  <div className="mr-4 flex flex-row justify-between gap-y-2 border-b border-panel-border pb-4 last:border-0">
    <div className="flex w-full max-w-[35rem] flex-col gap-y-2">
      <div>{name}</div>
      <div className="text-sm opacity-65">{description}</div>
    </div>
    <Button onClick={onClick} className="text-panel-text-primary">
      <Icon path={mdiPlayCircleOutline} size={1} />
    </Button>
  </div>
);

export default Action;
