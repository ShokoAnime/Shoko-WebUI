import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { mdiInformationOutline, mdiLoading, mdiMagnify, mdiOpenInNew } from '@mdi/js';
import { Icon } from '@mdi/react';
import { forEach } from 'lodash';
import { useDebounce, useEventCallback } from 'usehooks-ts';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import ModalPanel from '@/components/Panels/ModalPanel';
import toast from '@/components/Toast';
import { usePostFileRescanMutation } from '@/core/rtkQuery/splitV3Api/fileApi';
import { useGetSeriesAniDBSearchQuery } from '@/core/rtkQuery/splitV3Api/seriesApi';
import { copyToClipboard } from '@/core/util';
import { detectShow, findMostCommonShowName } from '@/core/utilities/auto-match-logic';

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
  const [fileRescanTrigger] = usePostFileRescanMutation();
  const [clickedLink, setClickedLink] = useState(false);
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
  const [searchText, setSearchText] = useState('');
  const [activeStep, setActiveStep] = useState(1);
  const [copyFailed, setCopyFailed] = useState(false);
  const debouncedSearch = useDebounce(searchText, 200);
  const searchQuery = useGetSeriesAniDBSearchQuery({ query: debouncedSearch }, { skip: !debouncedSearch });

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
    copyToClipboard(ed2kLinks)
      .then(() => {
        toast.success('ED2K hashes copied to clipboard!');
        setActiveStep(s => s + 1);
      })
      .catch(() => {
        toast.error('ED2K hashes copy failed!');
        setCopyFailed(true);
      });
  };

  const rescanFiles = useEventCallback(() => {
    onClose(true);

    let failedFiles = 0;
    forEach(fileIds, (fileId) => {
      fileRescanTrigger(fileId).unwrap().catch((error) => {
        failedFiles += 1;
        console.error(error);
      });
    });

    if (failedFiles) toast.error(`Rescan failed for ${failedFiles} files!`);
    if (failedFiles !== fileIds.length) toast.success(`Rescanning ${fileIds.length} files!`);
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
      title={<Title step={1} stepCount={2} count={fileIds.length} />}
      size="sm"
      titleLeft
      noPadding
    >
      <div className="flex flex-col gap-y-4 p-8">
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
            <div className="flex grow rounded-md border border-panel-border bg-panel-input p-4">
              <div className="shoko-scrollbar flex h-[14.5rem] flex-col gap-y-1 overflow-y-auto break-all rounded-md bg-panel-input pr-4">
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
              Search for a series using the provided search, then click on a result to add the copied hashes to AniDB,
              then click on the &apos;Rescan Files&apos; button afterwards.
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
              <div className="w-full rounded-md border border-panel-border bg-panel-input p-4 capitalize">
                <div className="shoko-scrollbar flex h-[9.5rem] flex-col gap-y-1 overflow-x-clip overflow-y-scroll rounded-md bg-panel-input pr-2 ">
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
                disabled={!clickedLink}
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
