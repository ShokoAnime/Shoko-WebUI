import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { mdiChevronDown, mdiChevronUp, mdiLoading, mdiMagnify } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { toNumber } from 'lodash';
import { useDebounceValue } from 'usehooks-ts';

import AnidbDescription from '@/components/Collection/AnidbDescription';
import Checkbox from '@/components/Input/Checkbox';
import Input from '@/components/Input/Input';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import { useSeriesTagsQuery } from '@/core/react-query/series/queries';
import useEventCallback from '@/hooks/useEventCallback';

import type { TagType } from '@/core/types/api/tags';

const cleanString = (input = '') => input.replaceAll(' ', '').toLowerCase();

function SeriesTag(props: { item: TagType }) {
  const { item } = props;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="flex max-w-[29.875rem] cursor-pointer flex-col gap-y-4 rounded-lg border border-panel-border bg-panel-background-transparent p-6"
      onClick={() => {
        setIsOpen(!isOpen);
      }}
    >
      <div className="flex justify-between text-xl font-semibold capitalize">
        {item.Name}
        &nbsp;
        <Icon path={isOpen ? mdiChevronUp : mdiChevronDown} size={1} />
      </div>
      <div className={cx('leading-5', { 'line-clamp-2': !isOpen })}>
        <AnidbDescription text={item?.Description ?? 'No description set.'} />
      </div>
    </div>
  );
}

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
        <div className="text-base font-semibold">Tag Source</div>
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
        <div className="text-base font-semibold">Display</div>
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
          // sticky
          transparent
        >
          {searchInput}
          {tagSources}
          {spoilers}
          <div className="flex flex-col gap-x-2">
            <div className="text-base font-semibold">Quick Actions</div>
            Change Sort | A-Z (&gt;)
            <br />
            Download Missing Data (&gt;)
          </div>
        </ShokoPanel>
      </div>
    );
  },
);

const SeriesTags = () => {
  const { seriesId } = useParams();

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
        || [cleanString(Name), cleanString(Description)].some(str => str.match(debouncedSearch)))
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
                {filteredTags?.map(item => <SeriesTag key={`${item.Source}-${item.ID}`} item={item} />)}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default SeriesTags;
