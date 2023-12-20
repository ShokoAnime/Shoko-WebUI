import React, { useCallback, useEffect, useState } from 'react';
import { mdiCheckUnderlineCircleOutline, mdiCloseCircleOutline, mdiMagnify, mdiPencilCircleOutline } from '@mdi/js';
import cx from 'classnames';

import Input from '@/components/Input/Input';
import { useSeriesQuery } from '@/core/react-query/series/queries';
// import { useLazyGetSeriesInfiniteQuery } from '@/core/rtkQuery/splitV3Api/seriesApi';

import type { SeriesTitleType } from '@/core/types/api/series';

type Props = {
  seriesId: number;
};

const NameTab = ({ seriesId }: Props) => {
  const [name, setName] = useState('');
  const [search, setSearch] = useState('');
  const [nameEditable, setNameEditable] = useState(false);

  const seriesQuery = useSeriesQuery(seriesId, { includeDataFrom: ['AniDB'] });

  // TODO: Needs an actual endpoint to get series names instead of getting all series
  // const [fetchSeries, seriesResults] = useLazyGetSeriesInfiniteQuery();
  // const getAniDbSeries = useMemo((): SeriesTitleType[] => {
  //   const pages = seriesResults.data?.pages;
  //   if (!pages) return [];
  //
  //   const keys = Object.keys(pages);
  //   if (!keys?.length) return [];
  //
  //   return pages[1];
  // }, [seriesResults]);

  // const searchSeries = useMemo(() =>
  //   debounce(async () => {
  //     await fetchSeries({
  //       startsWith: search,
  //       pageSize: 5,
  //     });
  //   }, 250), [search, fetchSeries]);

  useEffect(() => {
    setName(seriesQuery.data?.Name ?? '');
  }, [seriesQuery]);

  // useEffect(() => {
  //   if (!search) return;
  //   searchSeries()?.then()?.catch(console.error);
  // }, [search, searchSeries]);

  const renderTitle = useCallback((title: SeriesTitleType) => (
    <div
      className="flex cursor-pointer justify-between"
      key={title.Language}
      onClick={() => setName(title.Name)}
    >
      <div>{title.Name}</div>
      {title.Language}
    </div>
  ), []);

  const nameInputIcons = useCallback(() => {
    if (!nameEditable) {
      return [{
        icon: mdiPencilCircleOutline,
        className: 'text-panel-text-primary',
        onClick: () => setNameEditable(_ => true),
      }];
    }

    return [{
      icon: mdiCloseCircleOutline,
      className: 'text-red-500',
      onClick: () => setName(_ => ''),
    }, {
      icon: mdiCheckUnderlineCircleOutline,
      className: 'text-panel-text-primary',
      onClick: () => {}, // TODO: Need endpoint to update series
    }];
  }, [nameEditable]);

  return (
    <div className="flex flex-col">
      <Input
        id="name"
        type="text"
        onChange={e => setName(e.target.value)}
        value={name}
        label="Name"
        className="mb-4"
        endIcons={nameInputIcons()}
        disabled={!nameEditable}
      />
      <Input
        id="search"
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        startIcon={mdiMagnify}
        placeholder="Name Search..."
        disabled={!nameEditable}
        className={cx(!nameEditable && 'invisible')}
      />
      <div
        className={cx(
          'mt-1 flex flex-col gap-y-2.5 rounded-md border border-panel-border bg-panel-background-alt p-4 overflow-hidden',
          !nameEditable && 'invisible',
        )}
      >
        {!search && seriesQuery.data?.AniDB?.Titles.reduce((acc, title) => {
          if (!search) {
            acc.push(renderTitle(title));
            return acc;
          }
          if (title.Name.toLowerCase().includes(search.toLowerCase())) {
            acc.push(renderTitle(title));
            return acc;
          }
          return acc;
        }, [] as React.ReactNode[])}
        {/* {search && getAniDbSeries.map(title => renderTitle(title))} */}
      </div>
    </div>
  );
};

export default NameTab;
