import React from 'react';
import Modal from 'react-modal';

import Button from '@/components/Input/Button';

type Props = {
  onClose: () => void;
  show: boolean;
};

const WelcomeModal = (props: Props) => {
  const {
    onClose,
    show,
  } = props;

  Modal.setAppElement('#app-root');

  return (
    <Modal
      isOpen={show}
      onRequestClose={onClose}
      shouldCloseOnEsc={false}
      overlayClassName="fixed inset-0 bg-black/50 z-[110]"
      shouldCloseOnOverlayClick={false}
      className="flex h-full items-center justify-center"
    >
      <div className="flex h-fit w-full items-center justify-center">
        <div
          className="flex h-[66%] w-[37.5rem] flex-col rounded-lg border border-panel-border bg-panel-background drop-shadow-lg"
          onClick={event => event.stopPropagation()}
        >
          <div>
            <div className="rounded-t-lg border-b border-panel-border bg-panel-background-alt p-6 text-xl font-semibold">
              <div className="flex text-xl font-semibold">Hello From The Shoko Team!</div>
            </div>
          </div>
          <div className="flex grow flex-col gap-y-6">
            <div className="flex flex-col gap-y-6 p-6">
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
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default WelcomeModal;
