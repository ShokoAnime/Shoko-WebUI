import React, { useMemo, useState } from 'react';
import cx from 'classnames';
import { map } from 'lodash';
import { Icon } from '@mdi/react';
import { mdiInformationOutline, mdiPlayCircleOutline } from '@mdi/js';
import AnimateHeight from 'react-animate-height';

import toast from '@/components/Toast';
import ModalPanel from '@/components/Panels/ModalPanel';
import quickActions from '@/core/quick-actions';
import { useRunActionMutation } from '@/core/rtkQuery/splitV3Api/actionsApi';
import Button from '@/components/Input/Button';
import TransitionDiv from '@/components/TransitionDiv';

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
    //TODO: figure out better type for this
    const result: any = await runActionTrigger(action);
    if (!result.error) {
      toast.success(`Running action "${name}"`);
    }
  };

  const [showInfo, setShowInfo] = useState(false);

  const action = useMemo(() => quickActions[actionKey], []);
  const { name, functionName, info } = action;

  return (
    <TransitionDiv>
      <div className="flex justify-between gap-x-3">
        {name}
        <div className="flex gap-x-2.5">
          <Button onClick={() => setShowInfo(prev => !prev)} className="text-highlight-1">
            <Icon path={mdiInformationOutline} size={1} />
          </Button>
          <Button onClick={() => runAction(name, functionName)} className="text-highlight-1">
            <Icon path={mdiPlayCircleOutline} size={1} />
          </Button>
        </div>
      </div>
      <AnimateHeight height={showInfo ? 'auto' : 0}>
        <div className="flex bg-background-border rounded-md px-4 py-2 gap-x-2 mt-3">
          {/*Icon size reduces if not put in a div*/}
          <div className="mt-0.5">
            <Icon path={mdiInformationOutline} size={0.8333} />
          </div>
          {info}
        </div>
      </AnimateHeight>
    </TransitionDiv>
  );
};

function ActionsModal({ show, onClose }: Props) {
  const [activeTab, setActiveTab] = useState('import');

  return (
    <ModalPanel
      show={show}
      onRequestClose={onClose}
      className="p-8 flex-col drop-shadow-lg gap-y-8 w-[40rem]"
    >
      <div className="font-semibold text-xl">Actions</div>
      <div className="flex">
        <div className="flex flex-col min-w-[8rem] border-r-2 border-background-border gap-y-4">
          {map(actions, (value, key) => (
            <div
              className={cx('font-semibold cursor-pointer', activeTab === key && 'text-highlight-1')}
              key={key}
              onClick={() => setActiveTab(key)}
            >
              {value.title}
            </div>
          ))}
        </div>

        <div className="flex flex-col grow gap-y-2 pl-8">
          {actions[activeTab].data.map(key => (
            <Action actionKey={key} key={key} />
          ))}
        </div>
      </div>
    </ModalPanel>
  );
}

export default ActionsModal;
