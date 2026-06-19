import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { mdiInformationOutline, mdiLoading, mdiMagnify, mdiOpenInNew } from '@mdi/js';
import { Icon } from '@mdi/react';
import { countBy, some, toNumber } from 'lodash';
import { useDebounceValue } from 'usehooks-ts';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import ModalPanel from '@/components/Panels/ModalPanel';
import AniDbRulesModal from '@/components/Utilities/Unrecognized/AniDbRulesModal';
import { ANIDB_RULES_SNOOZE_KEY, anidbPrompts } from '@/components/Utilities/Unrecognized/AniDbRulesModal.constants';
import { useRescanFileMutation } from '@/core/react-query/file/mutations';
import { useSeriesAniDBSearchQuery } from '@/core/react-query/series/queries';
import { useSelector } from '@/core/store';
import toast from '@/core/toast';
import { copyToClipboard, dayjs } from '@/core/util';
import { detectShow, findMostCommonShowName } from '@/core/utilities/auto-match-logic';

type Props = {
  show: boolean;
  onClose: (refresh?: boolean) => void;
  fileIds: number[];
  links: string[];
};

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
    window.open(url, '_blank', 'noopener,noreferrer');
    setClickedLink(true);
  };

  const hasRulesSnooze = () => {
    const snoozeUntil = localStorage.getItem(ANIDB_RULES_SNOOZE_KEY);
    return snoozeUntil != null && dayjs(snoozeUntil).isAfter(dayjs());
  };

  const handleMassAddClick = (url: string) => {
    if (hasRulesSnooze()) {
      openAniDbPage(url);
      return;
    }

    setPromptSeed(currentSeed => currentSeed + 1);
    setSelectedMassAddUrl(url);
    setShowAniDbRulesModal(true);
  };

  const handleRulesProceed = () => {
    openAniDbPage(selectedMassAddUrl);
    setShowAniDbRulesModal(false);
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
                        <button
                          type="button"
                          onClick={() => handleMassAddClick(`https://anidb.net/anime/${result.ID}/release/add`)}
                          data-tooltip-id="tooltip"
                          className="line-clamp-1 text-left transition-colors hover:text-panel-text-primary"
                          data-tooltip-content="Mass Add"
                        >
                          {result.Title}
                        </button>
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
        stepDescription={
          <StepDescription>
            Review these AniDB file submission rules before opening the mass-add page.
          </StepDescription>
        }
      />
    </ModalPanel>
  );
};

export default AvDumpSeriesSelectModal;
