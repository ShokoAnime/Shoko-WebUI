import React, { useEffect, useMemo, useState } from 'react';
import { mdiCheckUnderlineCircleOutline, mdiCloseCircleOutline, mdiLoading, mdiPencilCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
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
    if (!nameEditable) {
      return [{
        icon: mdiPencilCircleOutline,
        className: 'text-panel-text-primary',
        onClick: toggleNameEditable,
      }];
    }

    return [
      {
        icon: mdiCloseCircleOutline,
        className: 'text-red-500',
        onClick: toggleNameEditable,
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
  }, [name, nameEditable, overrideTitle, series.IDs.ID, toggleNameEditable]);

  return (
    <div className="flex h-full flex-col">
      {seriesQuery.isFetching && (
        <div className="m-auto text-panel-text-primary">
          <Icon path={mdiLoading} size={3} spin />
        </div>
      )}

      {seriesQuery.isError && (
        <div className="m-auto text-lg font-semibold text-panel-text-danger">
          Series data could not be loaded!
        </div>
      )}

      {seriesQuery.isSuccess && (
        <>
          <Input
            id="name"
            type="text"
            onChange={e => setName(e.target.value)}
            value={name}
            label="Name"
            className="mb-4"
            endIcons={nameInputIcons}
            disabled={!nameEditable}
          />
          {nameEditable && (
            <div className="flex overflow-y-auto rounded-lg border border-panel-border bg-panel-background-alt p-4">
              <div className="flex grow flex-col gap-y-2.5 overflow-y-auto pr-4">
                {map(series.AniDB?.Titles, title => (
                  <div
                    className="flex cursor-pointer justify-between"
                    key={title.Language}
                    onClick={() => setName(title.Name)}
                  >
                    <div>{title.Name}</div>
                    {title.Language}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NameTab;
