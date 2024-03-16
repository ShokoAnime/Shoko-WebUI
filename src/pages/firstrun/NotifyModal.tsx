import React from 'react';

import Button from '@/components/Input/Button';
import ModalPanel from '@/components/Panels/ModalPanel';

type Props = {
  onClose: () => void;
  show: boolean;
};

const SuccessNotifyModal = (props: Props) => {
  const {
    onClose,
    show,
  } = props;

  return (
    <ModalPanel
      show={show}
      onRequestClose={onClose}
      header={<div className="flex text-xl font-semibold">Hello From The Shoko Team!</div>}
      size="sm"
      noPadding
      noGap
      fullHeight
      notCloseOnEsc
      notCloseOnOverlayClick
      containerClassName="!mt-0"
      className="h-fit"
    >
      <div className="flex flex-col gap-y-[24px] p-[24px]">
        <p>
          {`Congratulations, Shoko appears to be up and running smoothly, assuming the setup was done correctly. Now is
                the perfect opportunity to familiarize yourself with the Web UI's various features. Below, we've included some
                recommended links to explore, along with information on media player integration and support resources.`}
        </p>
        <p>
          {`If you're all set, you can click the button below to close this modal permanently. Remember, you can always
                find these links under your username in the top-right corner for future reference.`}
        </p>
        <p className="flex flex-col">
          <a className="font-semibold text-panel-text-primary" href="https://docs.shokoanime.com/">
            Using Shoko | ShokoDocs
          </a>
          <a className="font-semibold text-panel-text-primary" href="https://docs.shokoanime.com/faq/">
            Frequently Asked Questions | Shoko Docs
          </a>
        </p>
        <p className="flex flex-col">
          <a className="font-semibold text-panel-text-primary" href="https://docs.shokoanime.com/">
            Media Player Integrations | Shoko Docs
          </a>
          <a className="font-semibold text-panel-text-primary" href="https://discord.gg/vpeHDsg">
            Community & Staff Support | Discord
          </a>
        </p>

        <Button buttonSize="normal" buttonType="primary" onClick={onClose}>Set Me Free!</Button>
      </div>
    </ModalPanel>
  );
};

export default SuccessNotifyModal;
