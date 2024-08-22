import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { mdiInformationOutline, mdiLoading, mdiMagnify, mdiOpenInNew } from '@mdi/js';
import { Icon } from '@mdi/react';
import { countBy, forEach, some, toNumber } from 'lodash';
import { useDebounceValue } from 'usehooks-ts';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import ModalPanel from '@/components/Panels/ModalPanel';
import toast from '@/components/Toast';
import { useRescanFileMutation } from '@/core/react-query/file/mutations';
import { useSeriesAniDBSearchQuery } from '@/core/react-query/series/queries';
import { copyToClipboard } from '@/core/util';
import { detectShow, findMostCommonShowName } from '@/core/utilities/auto-match-logic';
import useEventCallback from '@/hooks/useEventCallback';

import type { RootState } from '@/core/store';

type Props = {
  show: boolean;
  onClose(refresh?: boolean): void;
  getLinks(): { fileIds: number[], links: string[] };
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
  <div className="flex justify-start gap-x-2 ">
    <Icon className="shrink-0" path={mdiInformationOutline} size={1} />
    <div className="flex">
      {children}
    </div>
  </div>
);

function AvDumpSeriesSelectModal({ getLinks, onClose, show }: Props) {
  const { mutateAsync: rescanFile } = useRescanFileMutation();
  const [clickedLink, setClickedLink] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activeStep, setActiveStep] = useState(1);
  const [copyFailed, setCopyFailed] = useState(false);

  const [debouncedSearch] = useDebounceValue(searchText, 200);
  const searchQuery = useSeriesAniDBSearchQuery(debouncedSearch, !!debouncedSearch);

  const avdumpList = useSelector((state: RootState) => state.utilities.avdump);
  const dumpInProgress = some(avdumpList.sessions, session => session.status === 'Running');

  const { ed2kLinks, fileIds, links } = useMemo(() => {
    if (!show) return { ed2kLinks: '', links: [], fileIds: [] };
    const { fileIds: tempFileIds, links: tempLinks } = getLinks();
    let tempEd2kLinks = '';
    forEach(tempLinks, (link) => {
      tempEd2kLinks += `${link}\n`;
    });
    return { ed2kLinks: tempEd2kLinks, links: tempLinks, fileIds: tempFileIds };
  }, [getLinks, show]);
  const commonSeries = useMemo(
    () => findMostCommonShowName(links.map(link => detectShow(link.split('|')[2]))),
    [links],
  );

  useEffect(() => {
    setSearchText(commonSeries);
  }, [commonSeries]);

  const handleNextStep = () => {
    setActiveStep(activeStep + 1);
  };

  const handlePreviousStep = () => {
    setCopyFailed(false);
    setActiveStep(activeStep - 1);
  };

  const handleCopy = () => {
    copyToClipboard(ed2kLinks, 'ED2K hashes')
      .then(() => setActiveStep(s => s + 1))
      .catch((error) => {
        console.error(error);
        setCopyFailed(true);
      });
  };

  const rescanFiles = useEventCallback(() => {
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
  });

  useLayoutEffect(() => () => {
    if (show) return;
    setSearchText('');
    setClickedLink(false);
    setCopyFailed(false);
    setActiveStep(1);
  }, [show]);

  return (
    <ModalPanel
      show={show}
      onRequestClose={onClose}
      header={<Title step={1} stepCount={2} count={fileIds.length} />}
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
                  'Click the blue button below to copy the ED2K hashes for use in the next step.'
                )}
            </StepDescription>
            <div className="flex grow rounded-lg border border-panel-border bg-panel-input p-4">
              <div className="shoko-scrollbar flex h-[14.5rem] flex-col gap-y-1 overflow-y-auto break-all rounded-lg bg-panel-input pr-4">
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
                onChange={e => setSearchText(e.target.value)}
                startIcon={mdiMagnify}
              />
              <div className="w-full rounded-lg border border-panel-border bg-panel-input p-4 capitalize">
                <div className="shoko-scrollbar flex h-[9.5rem] flex-col gap-y-1 overflow-x-clip overflow-y-scroll rounded-lg bg-panel-input pr-2 ">
                  {searchQuery.isError || searchQuery.isFetching
                    ? (
                      <div className="flex h-full items-center justify-center">
                        <Icon path={mdiLoading} size={3} spin className="text-panel-text-primary" />
                      </div>
                    )
                    : (searchQuery.data ?? []).map(result => (
                      <a
                        href={`https://anidb.net/anime/${result.ID}/release/add`}
                        key={result.ID}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between"
                        onClick={() => setClickedLink(true)}
                      >
                        <div className="line-clamp-1">{result.Title}</div>
                        <div className="text-panel-text-primary">
                          <Icon path={mdiOpenInNew} size={0.833} />
                        </div>
                      </a>
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
    </ModalPanel>
  );
}

export default AvDumpSeriesSelectModal;
