import React, { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router';
import { mdiLoading, mdiTagTextOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useDebounceValue, useToggle } from 'usehooks-ts';

import CleanDescription from '@/components/Collection/CleanDescription';
import TagDetailsModal from '@/components/Collection/Tags/TagDetailsModal';
import TagsSearchAndFilterPanel from '@/components/Collection/Tags/TagsSearchAndFilterPanel';
import { useSeriesTagsQuery } from '@/core/react-query/series/queries';
import useEventCallback from '@/hooks/useEventCallback';

import type { SeriesContextType } from '@/components/Collection/constants';
import type { TagType } from '@/core/types/api/tags';

const cleanString = (input = '') => input.replaceAll(' ', '').toLowerCase();

const SingleTag = React.memo(({ onTagExpand, tag }: { tag: TagType, onTagExpand: (tag: TagType) => void }) => {
  const emitTag = useEventCallback(() => onTagExpand(tag));
  const tagDescription = tag.Description?.trim() ? tag.Description : 'Tag Description Not Available.';

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
            data-tooltip-id="tooltip"
            data-tooltip-content={`${tag.Source} Tag`}
          />
        </div>
      </div>
      <CleanDescription
        className="line-clamp-2"
        text={tagDescription}
      />
    </div>
  );
});

const SeriesTags = () => {
  const { series } = useOutletContext<SeriesContextType>();

  const [selectedTag, setSelectedTag] = useState<TagType>();
  const [showTagModal, toggleShowTagModal] = useToggle(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounceValue(cleanString(search), 200);
  const [showSpoilers, toggleShowSpoilers] = useToggle();
  const [tagSourceFilter, setTagSourceFilter] = useState<Set<string>>(new Set());
  const [sort, toggleSort] = useToggle(false);

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
        toggleShowSpoilers();
        break;
      default:
        break;
    }
  });

  const { data: tagsQueryData, isLoading, isSuccess } = useSeriesTagsQuery(series.IDs.ID, { filter: 1 });

  const filteredTags = useMemo(
    () =>
      tagsQueryData?.filter((
        { Description, IsSpoiler, Name, Source },
      ) => (
        !(tagSourceFilter.has(Source) || (IsSpoiler && !showSpoilers))
        && ((debouncedSearch === '')
          || [Name, Description].some(str => cleanString(str).match(debouncedSearch)))
      )).sort((tagA, tagB) => (sort ? tagA.Name.localeCompare(tagB.Name) : 0)),
    [debouncedSearch, showSpoilers, sort, tagSourceFilter, tagsQueryData],
  );

  const header = useMemo(
    () => (
      <div className="flex h-[6.125rem] items-center justify-between rounded-lg border border-panel-border bg-panel-background-transparent px-6 py-5">
        <div className="flex flex-wrap text-xl font-semibold 2xl:flex-nowrap">
          <span>Tags</span>
          <span className="hidden px-2 2xl:inline">|</span>
          <span>
            {(debouncedSearch !== '' || tagSourceFilter.size > 0 || showSpoilers) && (
              <>
                <span className="pr-2 text-panel-text-important">
                  {filteredTags?.length}
                </span>
                of&nbsp;
              </>
            )}
            <span className="pr-2 text-panel-text-important">
              {isSuccess ? tagsQueryData.length : '-'}
            </span>
            Tags Listed
          </span>
        </div>
      </div>
    ),
    [debouncedSearch, filteredTags?.length, isSuccess, showSpoilers, tagSourceFilter.size, tagsQueryData?.length],
  );

  const onTagSelection = useEventCallback((tag: TagType) => {
    setSelectedTag(tag);
    toggleShowTagModal();
  });
  const clearTagSelection = useEventCallback(toggleShowTagModal);

  return (
    <>
      <title>{`${series.Name} > Tags | Shoko`}</title>
      <div className="flex w-full gap-x-6">
        <TagsSearchAndFilterPanel
          seriesId={series.IDs.ID}
          search={search}
          tagSourceFilter={tagSourceFilter}
          showSpoilers={showSpoilers}
          sort={sort}
          handleInputChange={handleInputChange}
          toggleSort={toggleSort}
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
                    <SingleTag key={`${tag.Source}-${tag.ID}`} tag={tag} onTagExpand={onTagSelection} />
                  ))}
                </div>
              )}
          </div>
        </div>
        <TagDetailsModal show={showTagModal} tag={selectedTag} onClose={clearTagSelection} />
      </div>
    </>
  );
};

export default SeriesTags;
