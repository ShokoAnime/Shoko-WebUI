import React, { useEffect, useMemo, useRef, useState } from 'react';
import { mdiFileDocumentMultipleOutline, mdiLoading, mdiMagnify, mdiOpenInNew } from '@mdi/js';
import { Icon } from '@mdi/react';
import { debounce, forEach } from 'lodash';
import { useEventCallback } from 'usehooks-ts';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import ModalPanel from '@/components/Panels/ModalPanel';
import toast from '@/components/Toast';
import { useLazyGetSeriesAniDBSearchQuery } from '@/core/rtkQuery/splitV3Api/seriesApi';
import { copyToClipboard } from '@/core/util';
import { detectShow, findMostCommonShowName } from '@/core/utilities/auto-match-logic';

type Props = {
  show: boolean;
  onClose(): void;
  getLinks(): string[];
};

function AvDumpSeriesSelectModal({ getLinks, onClose, show }: Props) {
  const { ed2kLinks, links } = useMemo(() => {
    if (!show) return { ed2kLinks: '', links: [] };
    const tempLinks = getLinks();
    let tempEd2kLinks = '';
    forEach(tempLinks, (link) => {
      tempEd2kLinks += `${link}\n`;
    });
    return { ed2kLinks: tempEd2kLinks, links: tempLinks };
  }, [getLinks, show]);
  const commonSeries = useMemo(() => findMostCommonShowName(links.map(link => detectShow(link.split('|')[2]))), [
    links,
  ]);
  const [searchText, setSearchText] = useState(() => commonSeries);
  const [searchTrigger, searchResults] = useLazyGetSeriesAniDBSearchQuery();

  const debouncedSearch = useRef(
    debounce((query: string) => {
      searchTrigger({ query, pageSize: 20 }).catch(() => {});
    }, 200),
  ).current;

  const handleSearch = useEventCallback((query: string) => {
    setSearchText(query);
    if (query !== '') debouncedSearch(query);
  });

  useEffect(() => () => {
    debouncedSearch.cancel();
  }, [debouncedSearch]);

  useEffect(() => {
    handleSearch(commonSeries);
  }, [commonSeries, handleSearch]);

  const handleCopy = () => {
    copyToClipboard(ed2kLinks)
      .then(() => toast.success('ED2K hashes copied to clipboard!'))
      .catch(() => toast.error('ED2K hashes copy failed!'));
  };

  return (
    <ModalPanel
      show={show}
      onRequestClose={onClose}
      title="AvDump Series Select"
    >
      <Button
        className="mt-4 flex items-center justify-center gap-x-2.5 bg-panel-text-primary p-2 font-semibold text-panel-text-alt"
        onClick={handleCopy}
      >
        <Icon path={mdiFileDocumentMultipleOutline} size={0.833} />
        Copy ED2K Hashes
      </Button>
      <div className="flex h-auto max-h-64 flex-col gap-y-1 overflow-y-auto break-all rounded-md bg-panel-background-alt p-4 text-sm">
        {links.map(link => <div key={`link-${link.split('|')[4]}`}>{link}</div>)}
      </div>
      <Input
        id="search"
        value={searchText}
        type="text"
        placeholder="Search..."
        onChange={e => handleSearch(e.target.value)}
        startIcon={mdiMagnify}
      />
      <div className="flex h-64 flex-col gap-y-1 overflow-y-auto overflow-x-clip rounded-md border border-panel-border bg-panel-background-alt p-4">
        {searchResults.isLoading
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
            >
              <div className="line-clamp-1">{result.Title}</div>
              <div className="text-panel-text-primary">
                <Icon path={mdiOpenInNew} size={0.833} />
              </div>
            </a>
          ))}
      </div>
    </ModalPanel>
  );
}

export default AvDumpSeriesSelectModal;
