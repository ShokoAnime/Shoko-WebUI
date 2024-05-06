import React from 'react';
import { mdiOpenInNew } from '@mdi/js';
import Icon from '@mdi/react';

import AnidbDescription from '@/components/Collection/AnidbDescription';
import ModalPanel from '@/components/Panels/ModalPanel';

import type { TagType } from '@/core/types/api/tags';

const TagDetailsModal = React.memo(({ onClose, show, tag }: { show: boolean, tag?: TagType, onClose: () => void }) => {
  const header = (
    <div className="flex w-full justify-between capitalize">
      <div>
        Tag |&nbsp;
        {tag?.Name}
      </div>
      {tag?.Source === 'AniDB' && (
        <a
          href={`https://anidb.net/tag/${tag.ID}`}
          className=" flex items-center gap-x-2 text-base text-panel-icon-action"
          rel="noopener noreferrer"
          target="_blank"
        >
          <div className="metadata-link-icon AniDB" />
          AniDB (
          {tag?.ID}
          )
          <Icon path={mdiOpenInNew} size={1} />
        </a>
      )}
    </div>
  );

  return (
    <ModalPanel show={show} onRequestClose={onClose} header={header} size="sm">
      <AnidbDescription text={tag?.Description ?? ''} className="line-clamp-[10] opacity-65" />
      <div className="flex flex-col gap-2">
        <div className="text-base font-bold">
          Series With Tag |&nbsp;
          <span className="text-panel-text-important">
            ?
          </span>
          &nbsp;Series
        </div>
        <div className="w-full rounded-lg bg-panel-input p-6">
          <div className="shoko-scrollbar flex max-h-[12.5rem] flex-col gap-y-2 overflow-y-auto">
            <div>Not yet implemented!</div>
            <div>Not yet implemented!</div>
          </div>
        </div>
      </div>
    </ModalPanel>
  );
});

export default TagDetailsModal;
