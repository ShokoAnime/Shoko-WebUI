import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { mdiLoading, mdiMagnify, mdiOpenInNew, mdiPlayCircleOutline, mdiTagTextOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { toNumber } from 'lodash';
import { useDebounceValue, useToggle } from 'usehooks-ts';

import AnidbDescription from '@/components/Collection/AnidbDescription';
import Checkbox from '@/components/Input/Checkbox';
import Input from '@/components/Input/Input';
import ModalPanel from '@/components/Panels/ModalPanel';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import { useSeriesTagsQuery } from '@/core/react-query/series/queries';
import useEventCallback from '@/hooks/useEventCallback';

import type { TagType } from '@/core/types/api/tags';

const cleanString = (input = '') => input.replaceAll(' ', '').toLowerCase();

const SeriesTag = React.memo(({ onTagExpand, tag }: { tag: TagType, onTagExpand: (tag: TagType) => void }) => {
  const emitTag = useEventCallback(() => onTagExpand(tag));

  return (
    <div
      className="flex h-[9.75rem] max-w-[29.875rem] cursor-pointer flex-col gap-6 rounded-lg border border-panel-border bg-panel-background-transparent p-6"
      onClick={emitTag}
    >
      <div className="flex flex-row items-center">
        <div className="line-clamp-2 grow text-xl font-semibold capitalize">
          {tag.Name}
        </div>
        <div>
          <Icon
            path={mdiTagTextOutline}
            size={1}
            className={tag.Source === 'User' ? 'text-panel-icon-important' : 'text-panel-icon-action'}
            title={`${tag.Source} Tag`}
          />
        </div>
      </div>
      <AnidbDescription className="line-clamp-2" text={tag.Description ?? ''} />
    </div>
  );
});

type SearchAndFilterPanelProps = {
  search: string;
  tagSourceFilter: Set<string>;
  showSpoilers: boolean;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};
const SearchAndFilterPanel = React.memo(
  ({ handleInputChange, search, showSpoilers, tagSourceFilter }: SearchAndFilterPanelProps) => {
    const searchInput = useMemo(() => (
      <Input
        id="search"
        label="Tag Search"
        startIcon={mdiMagnify}
        type="text"
        placeholder="Search..."
        value={search}
        onChange={handleInputChange}
      />
    ), [handleInputChange, search]);
    const tagSources = useMemo(() => (
      <div className="flex flex-col gap-y-2">
        <div className="text-base font-bold">Tag Source</div>
        <div className="flex flex-col gap-y-2 rounded-lg bg-panel-input p-6">
          {['AniDB', 'User'].map((tagSource: TagType['Source']) => (
            <Checkbox
              justify
              label={tagSource}
              key={tagSource}
              id={tagSource}
              isChecked={!tagSourceFilter.has(tagSource)}
              onChange={handleInputChange}
            />
          ))}
        </div>
      </div>
    ), [handleInputChange, tagSourceFilter]);
    const spoilers = useMemo(() => (
      <div className="flex flex-col gap-x-2">
        <div className="text-base font-bold">Display</div>
        <Checkbox
          id="show-spoilers"
          label="Show Spoiler Tags"
          isChecked={showSpoilers}
          onChange={handleInputChange}
          justify
        />
      </div>
    ), [handleInputChange, showSpoilers]);
    return (
      <div className="flex w-400 shrink-0 flex-col gap-y-6">
        <ShokoPanel
          title="Search & Filter"
          className="w-full"
          contentClassName="gap-y-6"
          fullHeight={false}
          sticky
          transparent
        >
          {searchInput}
          {tagSources}
          {spoilers}
          <div className="flex flex-col gap-2">
            <div className="text-base font-bold">Quick Actions</div>
            <button
              type="button"
              className="flex w-full flex-row justify-between disabled:cursor-not-allowed disabled:opacity-65"
              onClick={() => {}}
            >
              Change Sort | A-Z
              <Icon
                path={mdiPlayCircleOutline}
                className="pointer-events-auto text-panel-icon-action group-disabled:cursor-not-allowed"
                size={1}
              />
            </button>
            <button
              type="button"
              className="flex w-full flex-row justify-between disabled:cursor-not-allowed disabled:opacity-65"
              onClick={() => {}}
            >
              Download Missing Data | A-Z
              <Icon
                path={mdiPlayCircleOutline}
                className="pointer-events-auto text-panel-icon-action group-disabled:cursor-not-allowed"
                size={1}
              />
            </button>
          </div>
        </ShokoPanel>
      </div>
    );
  },
);

const TagModal = React.memo(({ onClose, show, tag }: { show: boolean, tag?: TagType, onClose: () => void }) => {
  const header = (
    <div className="flex w-full justify-between capitalize">
      <div>
        Tag |&nbsp;
        {tag?.Name}
      </div>
      {tag?.Source === 'AniDB' && (
        <a
          href={`https://anidb.net/tag/${tag.ID}`}
          className=" flex items-center gap-x-2 text-base text-panel-icon-action"
          rel="noopener noreferrer"
          target="_blank"
        >
          <div className="metadata-link-icon AniDB" />
          AniDB (
          {tag?.ID}
          )
          <Icon path={mdiOpenInNew} size={1} />
        </a>
      )}
    </div>
  );

  return (
    <ModalPanel show={show} onRequestClose={onClose} header={header} size="sm">
      <AnidbDescription text={tag?.Description ?? ''} className="line-clamp-[10] opacity-65" />
      <div className="flex flex-col gap-2">
        <div className="text-base font-bold">
          Series With Tag |&nbsp;
          <span className="text-panel-text-important">
            ?
          </span>
          &nbsp;Series
        </div>
        <div className="w-full rounded-lg bg-panel-input p-6">
          <div className="shoko-scrollbar flex max-h-[12.5rem] flex-col gap-y-2 overflow-y-auto">
            <div>Not yet implemented!</div>
            <div>Not yet implemented!</div>
          </div>
        </div>
      </div>
    </ModalPanel>
  );
});

const SeriesTags = () => {
  const { seriesId } = useParams();

  const [selectedTag, setSelectedTag] = useState<TagType>();
  const [showTagModal, toggleShowTagModal] = useToggle(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounceValue(() => cleanString(search), 200);
  const [showSpoilers, setShowSpoilers] = useState(false);
  const [tagSourceFilter, setTagSourceFilter] = useState<Set<string>>(new Set());

  const handleInputChange = useEventCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked, id: eventType, value } = event.target;
    switch (eventType) {
      case 'search':
        setSearch(value);
        break;
      case 'AniDB':
      case 'User':
        setTagSourceFilter((prevState) => {
          const tagSources = new Set(prevState);
          if (checked) {
            tagSources.delete(eventType);
          } else {
            tagSources.add(eventType);
          }
          return tagSources;
        });
        break;
      case 'show-spoilers':
        setShowSpoilers(checked);
        break;
      default:
        break;
    }
  });

  const { data: tagsQueryData, isLoading, isSuccess } = useSeriesTagsQuery(toNumber(seriesId!), {}, !!seriesId);

  const filteredTags = useMemo(
    () => (tagsQueryData?.filter((
      { Description, IsSpoiler, Name, Source },
    ) => (
      !(tagSourceFilter.has(Source) || (IsSpoiler && !showSpoilers))
      && ((debouncedSearch === '')
        || [Name, Description].some(str => cleanString(str).match(debouncedSearch)))
    ))),
    [debouncedSearch, showSpoilers, tagSourceFilter, tagsQueryData],
  );

  const header = useMemo(
    () => (
      <div className="flex h-[6.125rem] items-center justify-between rounded-lg border border-panel-border bg-panel-background-transparent px-6 py-5">
        <div className="flex flex-wrap text-xl font-semibold 2xl:flex-nowrap">
          <span>Tags</span>
          <span className="hidden px-2 2xl:inline">|</span>
          <span>
            <span className="pr-2 text-panel-text-important">
              {isSuccess ? tagsQueryData.length : '-'}
            </span>
            Tags Listed
          </span>
        </div>
      </div>
    ),
    [isSuccess, tagsQueryData?.length],
  );

  const onTagSelection = useEventCallback((tag: TagType) => {
    setSelectedTag(tag);
    toggleShowTagModal();
  });
  const clearTagSelection = useEventCallback(() => toggleShowTagModal());

  if (!seriesId) return null;

  return (
    <div className="flex w-full gap-x-6">
      <SearchAndFilterPanel
        search={search}
        tagSourceFilter={tagSourceFilter}
        showSpoilers={showSpoilers}
        handleInputChange={handleInputChange}
      />
      <div className="flex w-full flex-col gap-y-6">
        {header}
        <div className="flex grow flex-col gap-y-6">
          {isLoading
            ? (
              <div className="flex grow items-center justify-center text-panel-text-primary">
                <Icon path={mdiLoading} spin size={1} />
              </div>
            )
            : (
              <div className="grid grid-cols-3 gap-4 2xl:gap-6">
                {filteredTags?.map(tag => (
                  <SeriesTag key={`${tag.Source}-${tag.ID}`} tag={tag} onTagExpand={onTagSelection} />
                ))}
              </div>
            )}
        </div>
      </div>
      <TagModal show={showTagModal} tag={selectedTag} onClose={clearTagSelection} />
    </div>
  );
};

export default SeriesTags;
