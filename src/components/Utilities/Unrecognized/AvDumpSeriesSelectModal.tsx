import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { mdiInformationOutline, mdiLoading, mdiMagnify, mdiOpenInNew } from '@mdi/js';
import { Icon } from '@mdi/react';
import dayjs from 'dayjs';
import { countBy, some, toNumber } from 'lodash';
import { useDebounceValue } from 'usehooks-ts';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import Input from '@/components/Input/Input';
import ModalPanel from '@/components/Panels/ModalPanel';
import toast from '@/components/Toast';
import { useRescanFileMutation } from '@/core/react-query/file/mutations';
import { useSeriesAniDBSearchQuery } from '@/core/react-query/series/queries';
import { useSelector } from '@/core/store';
import { copyToClipboard } from '@/core/util';
import { detectShow, findMostCommonShowName } from '@/core/utilities/auto-match-logic';
import useToggleModalKeybinds from '@/hooks/useToggleModalKeybinds';

type Props = {
  show: boolean;
  onClose: (refresh?: boolean) => void;
  fileIds: number[];
  links: string[];
};

type AniDbPromptType = {
  answer: string;
  prompt: string;
};

const ANIDB_RULES_SNOOZE_KEY = 'anidb-add-files-rules-snooze-until';
const ANIDB_RULES_DELAY_SECONDS = 10;
const ANIDB_RULES_SNOOZE_DAYS = 30;

const anidbPrompts: AniDbPromptType[] = [
  {
    answer: 'private',
    prompt: 'Type the category name AniDB uses for disallowed files like remuxes and personal re-encodes.',
  },
  {
    answer: 'banned',
    prompt: 'Type the word that describes what can happen to your AniDB account if you ignore these rules.',
  },
  {
    answer: 'remuxes',
    prompt: 'Type the specific file type mentioned in the warning that AniDB does not allow users to add.',
  },
];

const Title = ({ count, step, stepCount }: { count: number, step: number, stepCount: number }) => (
  <div className="flex items-center gap-x-0.5 font-semibold">
    <div className="flex flex-col gap-y-1">
      <div className="flex text-xl">
        Add Series to AniDB
      </div>
      <div className="flex text-base font-semibold">
        Step &nbsp;
        {step}
        /
        {stepCount}
      </div>
    </div>
    <div className="flex grow" />
    <div className="flex gap-x-1">
      <div className="text-panel-text-important">{count < 0 ? '-' : count}</div>
      &nbsp;
      {count === 1 ? 'File' : 'Files'}
    </div>
  </div>
);

const StepDescription = ({ children }: { children: React.ReactNode }) => (
  <div className="flex justify-start gap-x-2">
    <Icon className="shrink-0" path={mdiInformationOutline} size={1} />
    <div className="flex">
      {children}
    </div>
  </div>
);

const AniDbRulesModal = ({
  challenge,
  onClose,
  onProceed,
  show,
}: {
  challenge: AniDbPromptType;
  onClose: () => void;
  onProceed: () => void;
  show: boolean;
}) => {
  const [answer, setAnswer] = useState('');
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(ANIDB_RULES_DELAY_SECONDS);

  useEffect(() => {
    if (!show) return undefined;

    setAnswer('');
    setDontShowAgain(false);
    setSecondsRemaining(ANIDB_RULES_DELAY_SECONDS);

    const interval = globalThis.setInterval(() => {
      setSecondsRemaining((currentSeconds) => {
        if (currentSeconds <= 1) {
          globalThis.clearInterval(interval);
          return 0;
        }

        return currentSeconds - 1;
      });
    }, 1000);

    return () => globalThis.clearInterval(interval);
  }, [challenge, show]);

  const isAnswerCorrect = answer.trim().toLowerCase() === challenge.answer;
  const canProceed = secondsRemaining === 0 && isAnswerCorrect;

  const handleProceed = () => {
    if (!canProceed) return;

    if (dontShowAgain) {
      globalThis.localStorage.setItem(
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
        <StepDescription>
          Review these AniDB file submission rules before opening the mass-add page.
        </StepDescription>
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

const AvDumpSeriesSelectModal = ({ fileIds, links, onClose, show }: Props) => {
  const { mutateAsync: rescanFile } = useRescanFileMutation();
  const [clickedLink, setClickedLink] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activeStep, setActiveStep] = useState(1);
  const [copyFailed, setCopyFailed] = useState(false);
  const [selectedMassAddUrl, setSelectedMassAddUrl] = useState('');
  const [showAniDbRulesModal, setShowAniDbRulesModal] = useState(false);
  const [promptSeed, setPromptSeed] = useState(0);

  const [debouncedSearch] = useDebounceValue(searchText, 200);
  const searchQuery = useSeriesAniDBSearchQuery(debouncedSearch, show && !!debouncedSearch);

  const avdumpList = useSelector(state => state.utilities.avdump);
  const dumpInProgress = some(avdumpList.sessions, session => session.status === 'Running');
  const ed2kLinks = links.join('\n');
  const commonSeries = findMostCommonShowName(links.map(link => detectShow(link.split('|')[2])));
  const rulesPrompt = useMemo(() => anidbPrompts[promptSeed % anidbPrompts.length], [promptSeed]);

  useEffect(() => {
    setSearchText(commonSeries);
  }, [commonSeries, show]);

  const handleNextStep = () => {
    setActiveStep(activeStep + 1);
  };

  const handlePreviousStep = () => {
    setCopyFailed(false);
    setActiveStep(activeStep - 1);
  };

  const handleCopy = () => {
    copyToClipboard(ed2kLinks, 'ED2K hashes')
      .then(() => setActiveStep(step => step + 1))
      .catch((error) => {
        console.error(error);
        setCopyFailed(true);
      });
  };

  const rescanFiles = () => {
    onClose(true);

    const promises = fileIds.map(fileId => rescanFile(toNumber(fileId)));

    Promise
      .allSettled(promises)
      .then((result) => {
        const failedCount = countBy(result, 'status').rejected;
        if (failedCount) toast.error(`Rescan failed for ${failedCount} files!`);
        if (failedCount !== fileIds.length) toast.success(`Rescanning ${fileIds.length} files!`);
      })
      .catch(console.error);
  };

  const openAniDbPage = (url: string) => {
    const newWindow = globalThis.open(url, '_blank', 'noopener,noreferrer');

    if (!newWindow) {
      toast.error('Could not open AniDB.', 'Please allow popups for this site and try again.');
      return false;
    }

    setClickedLink(true);
    return true;
  };

  const hasRulesSnooze = () => {
    const snoozeUntil = globalThis.localStorage.getItem(ANIDB_RULES_SNOOZE_KEY);
    return snoozeUntil != null && dayjs(snoozeUntil).isAfter(dayjs());
  };

  const handleMassAddClick = (event: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    event.preventDefault();

    if (hasRulesSnooze()) {
      openAniDbPage(url);
      return;
    }

    setPromptSeed(currentSeed => currentSeed + 1);
    setSelectedMassAddUrl(url);
    setShowAniDbRulesModal(true);
  };

  const handleRulesProceed = () => {
    const opened = openAniDbPage(selectedMassAddUrl);
    if (opened) setShowAniDbRulesModal(false);
  };

  useLayoutEffect(() => () => {
    if (show) return;
    setSearchText('');
    setClickedLink(false);
    setCopyFailed(false);
    setActiveStep(1);
    setSelectedMassAddUrl('');
    setShowAniDbRulesModal(false);
  }, [show]);

  return (
    <ModalPanel
      show={show}
      onRequestClose={onClose}
      header={<Title step={activeStep} stepCount={2} count={fileIds.length} />}
      size="sm"
      noPadding
    >
      <div className="flex flex-col gap-y-4 p-6">
        {activeStep === 1 && (
          <>
            <StepDescription>
              {copyFailed
                ? (
                  'Manually copy the ED2K hashes from the box below, then proceed to the next step.'
                )
                : (
                  'Click the rightmost button below to copy the ED2K hashes for use in the next step.'
                )}
            </StepDescription>
            <div className="flex grow rounded-lg border border-panel-border bg-panel-input p-4">
              <div className="flex h-58 flex-col gap-y-1 overflow-y-auto rounded-lg bg-panel-input pr-4 break-all">
                {links.length
                  ? links.map(link => <div key={`link-${link.split('|')[4]}`}>{link}</div>)
                  : <div>No files selected.</div>}
              </div>
            </div>
            <div className="flex justify-end gap-x-2.5">
              <Button
                buttonType="secondary"
                className="flex items-center justify-center px-4 py-2"
                onClick={() => onClose(false)}
              >
                Cancel
              </Button>
              {copyFailed || !links.length
                ? (
                  <Button
                    buttonType="primary"
                    className="flex items-center justify-center px-4 py-2"
                    onClick={handleNextStep}
                  >
                    Next Step
                  </Button>
                )
                : (
                  <Button
                    buttonType="primary"
                    className="flex items-center justify-center px-4 py-2"
                    onClick={handleCopy}
                  >
                    Copy ED2K Hashes
                  </Button>
                )}
            </div>
          </>
        )}
        {activeStep === 2 && (
          <>
            <StepDescription>
              Search for a series using the provided search, then click on a result to add the copied hashes to AniDB.
              Once all files have been dumped, you&apos;ll be able to click the &apos;Rescan Files &apos; button.
            </StepDescription>
            <div className="flex flex-col gap-y-2">
              <Input
                id="search"
                value={searchText}
                type="text"
                placeholder="Search..."
                onChange={event => setSearchText(event.target.value)}
                startIcon={mdiMagnify}
              />
              <div className="w-full rounded-lg border border-panel-border bg-panel-input p-4 capitalize">
                <div className="flex h-38 flex-col gap-y-1 overflow-x-clip overflow-y-scroll rounded-lg bg-panel-input pr-2">
                  {searchQuery.isError || searchQuery.isFetching
                    ? (
                      <div className="flex h-full items-center justify-center">
                        <Icon path={mdiLoading} size={3} spin className="text-panel-text-primary" />
                      </div>
                    )
                    : (searchQuery.data ?? []).map(result => (
                      <div key={result.ID} className="flex justify-between">
                        <a
                          href={`https://anidb.net/anime/${result.ID}/release/add`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={event =>
                            handleMassAddClick(event, `https://anidb.net/anime/${result.ID}/release/add`)}
                          data-tooltip-id="tooltip"
                          className="transition-colors hover:text-panel-text-primary"
                          data-tooltip-content="Mass Add"
                        >
                          <div className="line-clamp-1">{result.Title}</div>
                        </a>
                        <a
                          href={`https://anidb.net/anime/${result.ID}`}
                          aria-label="Check Series"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="items-center text-panel-text-primary"
                          data-tooltip-id="tooltip"
                          data-tooltip-content="Check Series"
                        >
                          <Icon path={mdiOpenInNew} size={0.833} />
                        </a>
                      </div>
                    ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-x-2.5">
              <Button
                buttonType="secondary"
                className="flex items-center justify-center px-4 py-2"
                onClick={handlePreviousStep}
              >
                Previous Step
              </Button>
              <Button
                buttonType="primary"
                className="flex items-center justify-center px-4 py-2"
                disabled={!clickedLink || dumpInProgress}
                onClick={rescanFiles}
              >
                Rescan Files
              </Button>
            </div>
          </>
        )}
      </div>
      <AniDbRulesModal
        challenge={rulesPrompt}
        onClose={() => setShowAniDbRulesModal(false)}
        onProceed={handleRulesProceed}
        show={showAniDbRulesModal}
      />
    </ModalPanel>
  );
};

export default AvDumpSeriesSelectModal;
