import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { mdiFileDocumentMultipleOutline, mdiLoading, mdiMagnify, mdiOpenInNew } from '@mdi/js';
import { Icon } from '@mdi/react';
import { debounce, forEach } from 'lodash';
import { useEventCallback } from 'usehooks-ts';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import ModalPanel from '@/components/Panels/ModalPanel';
import toast from '@/components/Toast';
import { usePostFileRescanMutation } from '@/core/rtkQuery/splitV3Api/fileApi';
import { useLazyGetSeriesAniDBSearchQuery } from '@/core/rtkQuery/splitV3Api/seriesApi';
import { copyToClipboard } from '@/core/util';
import { detectShow, findMostCommonShowName } from '@/core/utilities/auto-match-logic';

type Props = {
  show: boolean;
  onClose(refresh?: boolean): void;
  getLinks(): { fileIds: number[], links: string[] };
};

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
  const commonSeries = useMemo(() => findMostCommonShowName(links.map(link => detectShow(link.split('|')[2]))), [
    links,
  ]);
  const initRef = useRef(false);
  const [searchText, setSearchText] = useState(() => commonSeries);
  const [searchTrigger, searchResults] = useLazyGetSeriesAniDBSearchQuery();

  const debouncedSearch = useRef(
    debounce((query: string) => {
      searchTrigger({ query, pageSize: 20 }).catch(() => {});
    }, 200),
  ).current;

  const handleSearch = useEventCallback((query: string) => {
    setSearchText(query);
    if (query !== '') {
      if (initRef.current) {
        initRef.current = false;
        searchTrigger({ query, pageSize: 20 }).catch(() => {});
      } else {
        debouncedSearch(query);
      }
    }
  });

  useEffect(() => () => {
    debouncedSearch.cancel();
  }, [debouncedSearch]);

  useEffect(() => {
    handleSearch(commonSeries);
  }, [commonSeries, handleSearch]);

  useLayoutEffect(() => () => {
    if (show) return;
    initRef.current = true;
    setSearchText('');
    setClickedLink(false);
  }, [show]);

  const handleCopy = () => {
    copyToClipboard(ed2kLinks)
      .then(() => toast.success('ED2K hashes copied to clipboard!'))
      .catch(() => toast.error('ED2K hashes copy failed!'));
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
  return (
    <ModalPanel
      show={show}
      onRequestClose={onClose}
      title="Add Series To AniDB"
    >
      <div className="flex flex-col gap-y-4">
        <div className="font-semibold">Copy the ED2K hashes.</div>
        <div className="flex h-auto max-h-64 flex-col gap-y-1 overflow-y-auto break-all rounded-md bg-panel-input p-4 text-sm">
          {links.length
            ? links.map(link => <div key={`link-${link.split('|')[4]}`}>{link}</div>)
            : <div>No files selected.</div>}
        </div>
        <Button
          buttonType="primary"
          className="flex w-full items-center justify-center gap-x-2.5 p-2"
          disabled={!links.length}
          onClick={handleCopy}
        >
          <Icon path={mdiFileDocumentMultipleOutline} size={0.833} />
          Copy ED2K Hashes
        </Button>
        <div className="font-semibold">Find series and link the hashes on AniDB.</div>
        <div className="flex flex-col gap-y-2">
          <Input
            id="search"
            value={searchText}
            type="text"
            placeholder="Search..."
            onChange={e => handleSearch(e.target.value)}
            startIcon={mdiMagnify}
          />
          <div className="w-full rounded-md border border-panel-border bg-panel-input p-4 capitalize">
            <div className="flex h-72 flex-col gap-y-1 overflow-y-auto overflow-x-clip rounded-md bg-panel-input pr-2 ">
              {initRef.current || searchResults.isError || searchResults.isFetching
                ? (
                  <div className="flex h-full items-center justify-center">
                    <Icon path={mdiLoading} size={3} spin className="text-panel-text-primary" />
                  </div>
                )
                : (searchResults.data ?? []).map(result => (
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
        <div className="font-semibold">Once added to AniDB, click below to rescan.</div>
        <Button
          buttonType="primary"
          className="flex w-full items-center justify-center gap-x-2.5 p-2"
          disabled={!clickedLink}
          onClick={rescanFiles}
        >
          <Icon path={mdiFileDocumentMultipleOutline} size={0.833} />
          Rescan Files
        </Button>
      </div>
    </ModalPanel>
  );
}

export default AvDumpSeriesSelectModal;
