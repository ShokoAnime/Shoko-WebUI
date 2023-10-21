import React, { useMemo, useState } from 'react';
import AnimateHeight from 'react-animate-height';
import { mdiInformationOutline, mdiPlayCircleOutline } from '@mdi/js';
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
      'remove-missing-files-mylist',
      'remove-missing-files',
      'import-new-files',
      'run-import',
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

  const runAction = async (name: string, action) => {
    try {
      await runActionTrigger(action);
      toast.success(`Running action "${name}"`);
    } catch (err) {
      if (isErrorWithMessage(err)) {
        console.error(err.message);
      }
    }
  };

  const [showInfo, setShowInfo] = useState(false);

  const action = useMemo(() => quickActions[actionKey], [actionKey]);
  const { functionName, info, name } = action;

  return (
    <TransitionDiv>
      <div className="flex justify-between gap-x-3">
        {name}
        <div className="flex gap-x-2.5">
          <Button onClick={() => setShowInfo(prev => !prev)} className="text-panel-text-primary">
            <Icon path={mdiInformationOutline} size={1} />
          </Button>
          <Button onClick={() => runAction(name, functionName)} className="text-panel-text-primary">
            <Icon path={mdiPlayCircleOutline} size={1} />
          </Button>
        </div>
      </div>
      <AnimateHeight height={showInfo ? 'auto' : 0}>
        <div className="mt-3 flex gap-x-2 rounded-md border border-panel-border bg-panel-background-alt px-4 py-2">
          {/* Icon size reduces if not put in a div */}
          <div className="mt-0.5">
            <Icon path={mdiInformationOutline} size={0.8333} />
          </div>
          {info}
        </div>
      </AnimateHeight>
    </TransitionDiv>
  );
};

function ActionsModal({ onClose, show }: Props) {
  const [activeTab, setActiveTab] = useState('import');

  return (
    <ModalPanel
      show={show}
      onRequestClose={onClose}
      title="Actions"
    >
      <div className="flex">
        <div className="flex min-w-[8rem] flex-col gap-y-4 border-r-2 border-panel-border">
          {map(actions, (value, key) => (
            <div
              className={cx('font-semibold cursor-pointer', activeTab === key && 'text-panel-text-primary')}
              key={key}
              onClick={() => setActiveTab(key)}
            >
              {value.title}
            </div>
          ))}
        </div>

        <div className="flex grow flex-col gap-y-2 pl-8">
          {actions[activeTab].data.map(key => <Action actionKey={key} key={key} />)}
        </div>
      </div>
    </ModalPanel>
  );
}

export default ActionsModal;
