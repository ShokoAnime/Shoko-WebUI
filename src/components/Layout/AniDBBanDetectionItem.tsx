import React, { useState } from 'react';
import { useEventCallback } from 'usehooks-ts';
import { mdiInformationOutline, mdiOpenInNew } from '@mdi/js';
import Icon from '@mdi/react';

import { AniDBBanItemType, AniDBBanTypeEnum } from '@/core/types/signalr';

import ModalPanel from '@/components/Panels/ModalPanel';

type Props = {
  type: 'HTTP' | 'UDP';
  banStatus: AniDBBanItemType;
};

const AniDBBanDetectionItem = ({ type, banStatus }: Props) => {
  const [showModal, setModalOpen] = useState(false);

  const banType = type === 'HTTP' ? AniDBBanTypeEnum.HTTPBan : AniDBBanTypeEnum.UDPBan;

  const handleOpen = useEventCallback(() => {
    setModalOpen(true);
  });

  const handleClose = useEventCallback(() => {
    setModalOpen(false);
  });

  if (banStatus.updateType !== banType || !banStatus.value) {
    return null;
  }

  return (
    <>
      <div className="flex items-center font-semibold cursor-pointer gap-x-2.5" onClick={handleOpen}>
        <Icon path={mdiInformationOutline} size={1} className="text-header-warning" />
        AniDB {type} Ban Detected!
      </div>
      <ModalPanel
        show={showModal}
        onRequestClose={handleClose}
        className="p-8 flex-col drop-shadow-lg gap-y-8 w-[31.25rem]"
      >
        <h5 className="text-xl font-bold">AniDB {type} Ban Detected</h5>
        <div className="flex flex-col gap-y-8">
          <p>
            It looks like you’ve been <span className="text-panel-important font-bold">temporarily banned</span> for
            excessive connection attempts. It happens and just means you’ll need to wait a bit for the temporary ban to
            expire.
          </p>
          <p>
            Click the link below to learn more and how you can minimize the chances of an AniDB Ban.
          </p>
          <a href="https://docs.shokoanime.com/faq" target="_blank" rel="noopener noreferrer" className="text-panel-primary font-bold flex gap-x-2">
            AniDB Ban | Shoko Docs
            <Icon path={mdiOpenInNew} size={1} />
          </a>
        </div>
      </ModalPanel>
    </>
  );
};

export default AniDBBanDetectionItem;
