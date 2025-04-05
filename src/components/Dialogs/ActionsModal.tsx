import React, { useMemo, useState } from 'react';
import cx from 'classnames';
import { map } from 'lodash';

import ModalPanel from '@/components/Panels/ModalPanel';
import toast from '@/components/Toast';
import quickActions from '@/core/quick-actions';
import { useRunActionMutation } from '@/core/react-query/action/mutations';
import { useInvalidatePlexTokenMutation } from '@/core/react-query/plex/mutations';
import useEventCallback from '@/hooks/useEventCallback';

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
      'add-all-manually-linked-files-to-mylist',
      'update-all-anidb-info',
      'update-anidb-calendar',
      'get-anidb-notifications',
      'process-moved-files',
      'sync-mylist',
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
      'purge-all-tvdb-info',
    ],
  },
  tmdb: {
    title: 'TMDB',
    data: [
      'search-for-tmdb-matches',
      'update-all-tmdb-shows',
      'delete-unused-tmdb-shows',
      'update-all-tmdb-movies',
      'delete-unused-tmdb-movies',
      'download-missing-tmdb-people',
      'purge-tmdb-movie-collections',
      'purge-tmdb-show-alternate-orderings',
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
      'plex-force-unlink',
    ],
  },
};

const isActionTab = (type: string): type is keyof typeof actions => type in actions;

type Props = {
  show: boolean;
  onClose: () => void;
};

const Action = ({ actionKey, length }: { actionKey: string, length: number }) => {
  const { mutate: runAction } = useRunActionMutation();
  const { mutate: invalidatePlexToken } = useInvalidatePlexTokenMutation();

  const action = useMemo(() => quickActions[actionKey], [actionKey]);
  const { functionName, name } = action;

  const handleAction = useEventCallback(() => {
    if (actionKey === 'plex-force-unlink') {
      invalidatePlexToken(undefined, {
        onSuccess: () => toast.success('Plex token invalidated!'),
      });
      return;
    }
    runAction(functionName, {
      onSuccess: () => toast.success(`Running action "${name}"`),
    });
  });

  return (
    <div
      className={cx(
        'flex flex-row justify-between gap-y-2 cursor-pointer hover:text-panel-text-primary transition-colors',
        length > 5 ? 'mr-4' : '',
      )}
      onClick={handleAction}
    >
      <div className="flex w-full flex-col gap-y-1">
        <div className="flex justify-between">
          <div>{name}</div>
        </div>
        <div className="text-sm text-panel-text opacity-65">{quickActions[actionKey].info}</div>
      </div>
    </div>
  );
};

function ActionsModal({ onClose, show }: Props) {
  const [activeTab, setActiveTab] = useState('import');

  return (
    <ModalPanel
      show={show}
      onRequestClose={onClose}
      header="Actions"
      size="md"
      noPadding
    >
      <div className="flex h-[29rem] gap-x-6 p-6">
        <div className="flex shrink-0 flex-col gap-y-6  font-semibold">
          <div className="flex flex-col gap-y-1">
            {map(actions, (value, key) => (
              <div
                className={cx(
                  activeTab === key
                    ? 'w-[7.5rem] text-center bg-panel-menu-item-background p-3 rounded-lg text-panel-menu-item-text cursor-pointer'
                    : 'w-[7.5rem] text-center p-3 rounded-lg hover:bg-panel-menu-item-background-hover cursor-pointer transition-colors',
                )}
                key={key}
                onClick={() => setActiveTab(key)}
              >
                {value.title}
              </div>
            ))}
          </div>
        </div>
        <div className="border-r border-panel-border" />
        <div className="flex grow">
          <div className="scroll-gutter flex grow flex-col gap-y-4 overflow-y-auto">
            {isActionTab(activeTab)
              && actions[activeTab].data.map((key: string) => (
                <Action actionKey={key} key={key} length={actions[activeTab].data.length} />
              ))}
          </div>
        </div>
      </div>
    </ModalPanel>
  );
}

export default ActionsModal;
