import React, { useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import Input from '@/components/Input/Input';
import ModalPanel from '@/components/Panels/ModalPanel';
import { ANIDB_RULES_SNOOZE_KEY } from '@/components/Utilities/Unrecognized/AniDbRulesModal.constants';
import { dayjs } from '@/core/util';
import useToggleModalKeybinds from '@/hooks/useToggleModalKeybinds';

import type { AniDbPromptType } from '@/components/Utilities/Unrecognized/AniDbRulesModal.constants';

type Props = {
  challenge: AniDbPromptType;
  onClose: () => void;
  onProceed: () => void;
  show: boolean;
  stepDescription: React.ReactNode;
};

const ANIDB_RULES_DELAY_SECONDS = 10;
const ANIDB_RULES_SNOOZE_DAYS = 30;

const AniDbRulesModal = ({
  challenge,
  onClose,
  onProceed,
  show,
  stepDescription,
}: Props) => {
  const [answer, setAnswer] = useState('');
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(ANIDB_RULES_DELAY_SECONDS);

  useEffect(() => {
    if (!show) return undefined;

    setAnswer('');
    setDontShowAgain(false);
    setSecondsRemaining(ANIDB_RULES_DELAY_SECONDS);

    const interval = setInterval(() => {
      setSecondsRemaining((currentSeconds) => {
        if (currentSeconds <= 1) {
          clearInterval(interval);
          return 0;
        }

        return currentSeconds - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [challenge, show]);

  const isAnswerCorrect = answer.trim().toLowerCase() === challenge.answer;
  const canProceed = secondsRemaining === 0 && isAnswerCorrect;

  const handleProceed = () => {
    if (!canProceed) return;

    if (dontShowAgain) {
      localStorage.setItem(
        ANIDB_RULES_SNOOZE_KEY,
        dayjs().add(ANIDB_RULES_SNOOZE_DAYS, 'day').toISOString(),
      );
    }

    onProceed();
  };

  useToggleModalKeybinds(show, 'nested-modal');
  useHotkeys('escape', onClose, { scopes: 'nested-modal' });
  useHotkeys('enter', () => {
    if (!canProceed) return;
    handleProceed();
  }, { scopes: 'nested-modal' });

  return (
    <ModalPanel
      show={show}
      onRequestClose={onClose}
      header="AniDB Rules Confirmation"
      size="sm"
      overlayClassName="!z-[90]"
    >
      <div className="flex flex-col gap-y-4">
        {stepDescription}
        <div className="rounded-lg border border-panel-border bg-panel-background-alt p-4">
          <div className="font-semibold text-panel-text-important">
            Do not add private files such as remuxes or your own re-encodes.
          </div>
          <div className="mt-2 text-sm opacity-80">
            Submitting files that break AniDB&apos;s rules can get your account banned and creates unnecessary work for
            AniDB moderators.
          </div>
          <a
            href="https://wiki.anidb.net/Content:Files"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex text-sm font-semibold text-panel-text-primary transition-colors hover:opacity-80"
          >
            Review AniDB file rules
          </a>
        </div>
        <div className="flex flex-col gap-y-2">
          <div className="font-semibold">{challenge.prompt}</div>
          <Input
            id="anidb-rules-answer"
            value={answer}
            type="text"
            placeholder="Enter your answer"
            onChange={event => setAnswer(event.target.value)}
            className="w-full"
          />
          <div className="text-sm opacity-65">
            Wait &nbsp;
            {secondsRemaining}
            &nbsp;
            {secondsRemaining === 1 ? 'second' : 'seconds'}
            &nbsp;and answer correctly to continue.
          </div>
        </div>
        <Checkbox
          id="anidb-rules-snooze"
          isChecked={dontShowAgain}
          onChange={event => setDontShowAgain(event.target.checked)}
          label="Don&apos;t show this warning again for 30 days"
          labelRight
        />
        <div className="flex justify-end gap-x-2.5">
          <Button
            buttonType="secondary"
            className="flex items-center justify-center px-4 py-2"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            buttonType="primary"
            className="flex items-center justify-center px-4 py-2"
            disabled={!canProceed}
            onClick={handleProceed}
          >
            Open AniDB Add Page
          </Button>
        </div>
      </div>
    </ModalPanel>
  );
};

export default AniDbRulesModal;
