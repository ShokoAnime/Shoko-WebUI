import React, { useMemo, useState } from 'react';
import { mdiPlayCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { map } from 'lodash';

import Button from '@/components/Input/Button';
import ModalPanel from '@/components/Panels/ModalPanel';
import toast from '@/components/Toast';
import TransitionDiv from '@/components/TransitionDiv';
import quickActions from '@/core/quick-actions';
import { useRunActionMutation } from '@/core/rtkQuery/splitV3Api/actionsApi';
import { isErrorWithMessage } from '@/core/util';

const actions = {
  import: {
    title: 'Import',
    data: [
      'run-import',
      'remove-missing-files-mylist',
      'remove-missing-files',
      'import-new-files',
    ],
  },
  anidb: {
    title: 'AniDB',
    data: [
      'download-missing-anidb-data',
      'sync-votes',
      'sync-mylist',
      'add-all-manually-linked-files-to-mylist',
      'update-all-anidb-info',
      'update-anidb-calendar',
    ],
  },
  trakt: {
    title: 'Trakt',
    data: [
      'sync-trakt',
      'update-all-trakt-info',
    ],
  },
  tvdb: {
    title: 'TvDB',
    data: [
      'regen-tvdb-links',
      'update-all-tvdb-info',
    ],
  },
  moviedb: {
    title: 'TMDB',
    data: [
      'update-all-moviedb-info',
    ],
  },
  shoko: {
    title: 'Shoko',
    data: [
      'avdump-mismatched-files',
      'recreate-all-groups',
      'rename-all-groups',
      'update-missing-anidb-file-release-groups',
      'update-missing-anidb-file-info',
      'update-all-mediainfo',
      'update-series-stats',
    ],
  },
  images: {
    title: 'Images',
    data: [
      'update-all-images',
      'validate-all-images',
    ],
  },
  plex: {
    title: 'Plex',
    data: [
      'plex-sync-all',
    ],
  },
};

type Props = {
  show: boolean;
  onClose: () => void;
};

const Action = ({ actionKey }: { actionKey: string }) => {
  const [runActionTrigger] = useRunActionMutation();

  const runAction = async (name: string, action: string) => {
    try {
      await runActionTrigger(action);
      toast.success(`Running action "${name}"`);
    } catch (err) {
      if (isErrorWithMessage(err)) {
        console.error(err.message);
      }
    }
  };

  const action = useMemo(() => quickActions[actionKey], [actionKey]);
  const { functionName, name } = action;

  return (
    <TransitionDiv className="flex flex-col gap-y-2">
      <div className="flex justify-between">
        {name}
        <Button onClick={() => runAction(name, functionName)} className="text-panel-icon-action">
          <Icon path={mdiPlayCircleOutline} size={1} />
        </Button>
      </div>
      <div className="flex text-sm text-panel-text opacity-65">
        {quickActions[actionKey].info}
      </div>
    </TransitionDiv>
  );
};

function ActionsModal({ onClose, show }: Props) {
  const [activeTab, setActiveTab] = useState('import');

  return (
    <ModalPanel
      show={show}
      onRequestClose={onClose}
      noPadding
    >
      <div className="flex h-[26.75rem]">
        <div className="flex shrink-0 flex-col gap-y-8 border-r border-panel-border bg-panel-background-alt p-8 font-semibold">
          <div className="text-xl">Actions</div>
          <div className="flex flex-col gap-y-4">
            {map(actions, (value, key) => (
              <div
                className={cx('cursor-pointer', activeTab === key && 'text-panel-text-primary')}
                key={key}
                onClick={() => setActiveTab(key)}
              >
                {value.title}
              </div>
            ))}
          </div>
        </div>

        <div className="flex grow p-8 pr-6">
          <div className="scroll-gutter flex grow flex-col gap-y-4 overflow-y-auto pr-2">
            {actions[activeTab].data.map((key: string) => <Action actionKey={key} key={key} />)}
          </div>
        </div>
      </div>
    </ModalPanel>
  );
}

export default ActionsModal;
