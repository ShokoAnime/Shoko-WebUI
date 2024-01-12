import React, { useState } from 'react';
import { mdiInformationOutline, mdiOpenInNew } from '@mdi/js';
import Icon from '@mdi/react';

import ModalPanel from '@/components/Panels/ModalPanel';
import { AniDBBanTypeEnum } from '@/core/types/signalr';

import type { AniDBBanItemType } from '@/core/types/signalr';

type Props = {
  type: 'HTTP' | 'UDP';
  banStatus: AniDBBanItemType;
};

const AniDBBanDetectionItem = ({ banStatus, type }: Props) => {
  const [showModal, setModalOpen] = useState(false);

  const banType = type === 'HTTP' ? AniDBBanTypeEnum.HTTPBan : AniDBBanTypeEnum.UDPBan;

  if (banStatus.updateType !== banType || !banStatus.value) {
    return null;
  }

  return (
    <>
      <div className="flex cursor-pointer items-center gap-x-2.5 font-semibold" onClick={() => setModalOpen(true)}>
        <Icon path={mdiInformationOutline} size={1} className="text-topnav-icon-warning" />
        AniDB&nbsp;
        {type}
        &nbsp;Ban Detected!
      </div>
      <ModalPanel
        show={showModal}
        onRequestClose={() => setModalOpen(false)}
        size="sm"
        header={`AniDB ${type} Ban Detected`}
      >
        <div className="flex flex-col gap-y-8">
          <p>
            It looks like you’ve been&nbsp;
            <span className="font-bold text-panel-text-important">temporarily banned</span>
            &nbsp;for excessive connection attempts. It happens and just means you’ll need to wait a bit for the
            temporary ban to expire.
          </p>
          <p>
            Click the link below to learn more and how you can minimize the chances of an AniDB Ban.
          </p>
          <a
            href="https://docs.shokoanime.com/faq"
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-x-2 font-bold text-panel-text-primary"
          >
            AniDB Ban | Shoko Docs
            <Icon path={mdiOpenInNew} size={1} />
          </a>
        </div>
      </ModalPanel>
    </>
  );
};

export default AniDBBanDetectionItem;
