import React, { useEffect, useMemo, useState } from 'react';
import { mdiCheckUnderlineCircleOutline, mdiCloseCircleOutline, mdiPencilCircleOutline } from '@mdi/js';
import cx from 'classnames';
import { map } from 'lodash';
import { useToggle } from 'usehooks-ts';

import Input from '@/components/Input/Input';
import toast from '@/components/Toast';
import { useOverrideSeriesTitleMutation } from '@/core/react-query/series/mutations';
import { useSeriesQuery } from '@/core/react-query/series/queries';

import type { SeriesType } from '@/core/types/api/series';

type Props = {
  seriesId: number;
};

const NameTab = ({ seriesId }: Props) => {
  const [name, setName] = useState('');
  const [nameEditable, toggleNameEditable] = useToggle(false);

  const seriesQuery = useSeriesQuery(seriesId, { includeDataFrom: ['AniDB'] });
  const series = useMemo(() => seriesQuery?.data ?? {} as SeriesType, [seriesQuery.data]);

  const { mutate: overrideTitle } = useOverrideSeriesTitleMutation();

  useEffect(() => {
    setName(series.Name ?? '');
  }, [series.Name]);

  const nameInputIcons = useMemo(() => {
    if (!nameEditable || seriesQuery.isFetching) {
      return [{
        icon: mdiPencilCircleOutline,
        className: 'text-panel-text-primary',
        onClick: toggleNameEditable,
      }];
    }

    return [
      {
        icon: mdiCloseCircleOutline,
        className: 'text-panel-text-danger',
        onClick: () => {
          setName(series.Name);
          toggleNameEditable();
        },
      },
      {
        icon: mdiCheckUnderlineCircleOutline,
        className: 'text-panel-text-primary',
        onClick: () =>
          overrideTitle({ seriesId: series.IDs.ID, Title: name }, {
            onSuccess: () => {
              toast.success('Name updated successfully!');
              toggleNameEditable();
            },
            onError: () => toast.error('Name could not be updated!'),
          }),
      },
    ];
  }, [name, nameEditable, overrideTitle, series.IDs.ID, series.Name, seriesQuery.isFetching, toggleNameEditable]);

  return (
    <div className="flex h-full flex-col">
      {seriesQuery.isError && (
        <div className="m-auto text-lg font-semibold text-panel-text-danger">
          Series data could not be loaded!
        </div>
      )}

      <Input
        id="name"
        type="text"
        onChange={e => setName(e.target.value)}
        value={name}
        label="Name"
        className="mb-4"
        inputClassName={cx(nameInputIcons.length > 1 ? 'pr-[4.5rem]' : 'pr-10', 'truncate')}
        endIcons={nameInputIcons}
        disabled={!nameEditable}
      />
      {nameEditable && (
        <div className="flex cursor-pointer overflow-y-auto rounded-lg border border-panel-border bg-panel-input p-6">
          <div className="shoko-scrollbar flex grow flex-col gap-y-2 overflow-y-auto bg-panel-input pr-4">
            {map(series.AniDB?.Titles, title => (
              <div
                className="flex justify-between last:border-none hover:text-panel-text-primary"
                key={title.Name + title.Language}
                onClick={() => setName(title.Name)}
              >
                <div>{title.Name}</div>
                <div className="shrink-0 text-right uppercase">{title.Language}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NameTab;
