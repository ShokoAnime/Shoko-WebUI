import React, { useEffect, useRef, useState } from 'react';
import ModalPanel from '../../../../components/Panels/ModalPanel';
import Button from '../../../../components/Input/Button';
import { Icon } from '@mdi/react';
import { mdiFileDocumentMultipleOutline, mdiLoading, mdiMagnify, mdiOpenInNew } from '@mdi/js';
import { useLazyGetSeriesAniDBSearchQuery } from '../../../../core/rtkQuery/splitV3Api/seriesApi';
import { debounce } from 'lodash';
import Input from '../../../../components/Input/Input';
import CopyToClipboard from 'react-copy-to-clipboard';

type Props = {
  show: boolean;
  onClose: () => void;
  links: string[];
};

function AvDumpSeriesSelectModal({ show, onClose, links }: Props) {
  const [searchText, setSearchText] = useState('');

  const [searchTrigger, searchResults] = useLazyGetSeriesAniDBSearchQuery();

  const debouncedSearch = useRef(
    debounce( (query: string) => {
      searchTrigger({ query, pageSize: 20 }).catch(() => {});
    }, 200),
  ).current;

  const handleSearch = (query: string) => {
    setSearchText(query);
    if (query !== '')
      debouncedSearch(query);
  };

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const copyEd2kLinks = () => {
    let ed2kLinks = '';
    links.forEach(link => ed2kLinks += `${link}\n`);
    return ed2kLinks;
  };

  return (
    <ModalPanel
      show={show}
      onRequestClose={onClose}
      className="p-8 flex-col drop-shadow-lg"
    >
      <div className="font-semibold text-xl">AvDump Series Select</div>
      <CopyToClipboard text={copyEd2kLinks()}>
        <Button className="bg-highlight-1 mt-8 p-2 flex items-center justify-center gap-x-2.5 font-semibold">
          <Icon path={mdiFileDocumentMultipleOutline} size={0.833} />
          Copy ED2K Hashes
        </Button>
      </CopyToClipboard>
      <div className="mt-4 p-4 overflow-y-auto break-all h-48 rounded-md bg-background-border">
        {links.map(link => (
          <div className="first:mt-0 mt-1 text-sm">{link}</div>
        ))}
      </div>
      <Input id="search" value={searchText} type="text" placeholder="Search..." onChange={e => handleSearch(e.target.value)} startIcon={mdiMagnify} className="mt-4" />
      <div className="mt-4 p-4 overflow-x-clip overflow-y-auto h-64 rounded-md bg-background-border">
        {searchResults.isLoading ?
          (<div className="flex h-full justify-center items-center">
            <Icon path={mdiLoading} size={3} spin className="text-highlight-1" />
          </div>) :
          (searchResults.data ?? []).map(result => (
            <a href={`https://anidb.net/anime/${result.ID}/release/add`} key={result.ID} target="_blank" rel="noopener noreferrer" className="flex justify-between first:mt-0 mt-1 items-center">
              <div className="line-clamp-1">{result.Title}</div>
              <div className="text-highlight-1">
                <Icon path={mdiOpenInNew} size={0.833} />
              </div>
            </a>
          ))
        }
      </div>
    </ModalPanel>
  );
}

export default AvDumpSeriesSelectModal;