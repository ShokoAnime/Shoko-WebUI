import React, { useEffect, useMemo, useState } from 'react';
import { mdiCheckUnderlineCircleOutline, mdiCloseCircleOutline, mdiPencilCircleOutline } from '@mdi/js';
import cx from 'classnames';
import { useToggle } from 'usehooks-ts';

import Input from '@/components/Input/Input';
import toast from '@/components/Toast';
import { useOverrideSeriesTitleMutation } from '@/core/react-query/series/mutations';
import { useSeriesQuery } from '@/core/react-query/series/queries';

type Props = {
  seriesId: number;
};

const NameTab = ({ seriesId }: Props) => {
  const [name, setName] = useState('');
  const [nameEditable, toggleNameEditable] = useToggle(false);

  const { data: seriesData, isError, isFetching, isSuccess } = useSeriesQuery(seriesId, { includeDataFrom: ['AniDB'] });

  const { mutate: overrideTitle } = useOverrideSeriesTitleMutation();

  useEffect(() => {
    setName(seriesData?.Name ?? '');
  }, [seriesData?.Name]);

  const nameInputIcons = useMemo(() => {
    if (!nameEditable || isFetching) {
      return [{
        icon: mdiPencilCircleOutline,
        className: 'text-panel-text-primary',
        onClick: toggleNameEditable,
      }];
    }

    if (!isSuccess) return [];

    return [
      {
        icon: mdiCloseCircleOutline,
        className: 'text-panel-text-danger',
        onClick: () => {
          setName(seriesData.Name ?? '');
          toggleNameEditable();
        },
      },
      {
        icon: mdiCheckUnderlineCircleOutline,
        className: 'text-panel-text-primary',
        onClick: () =>
          overrideTitle({ seriesId: seriesData.IDs.ID, Title: name }, {
            onSuccess: () => {
              toast.success('Name updated successfully!');
              toggleNameEditable();
            },
            onError: () => toast.error('Name could not be updated!'),
          }),
      },
    ];
  }, [
    isFetching,
    isSuccess,
    name,
    nameEditable,
    overrideTitle,
    seriesData?.IDs.ID,
    seriesData?.Name,
    toggleNameEditable,
  ]);

  return (
    <div className="flex h-full flex-col">
      {isError && (
        <div className="m-auto text-lg font-semibold text-panel-text-danger">
          Series data could not be loaded!
        </div>
      )}

      <Input
        id="name"
        type="text"
        onChange={e => setName(e.target.value)}
        value={name}
        placeholder="Loading..."
        label="Name"
        className="mb-4"
        inputClassName={cx(nameInputIcons.length > 1 ? 'pr-[4.5rem]' : 'pr-10', 'truncate')}
        endIcons={nameInputIcons}
        disabled={!nameEditable}
      />
      {nameEditable && (
        <div className="flex cursor-pointer overflow-y-auto rounded-lg border border-panel-border bg-panel-input p-6">
          <div className="shoko-scrollbar flex grow flex-col gap-y-2 overflow-y-auto bg-panel-input pr-4">
            {seriesData?.AniDB?.Titles.map(title => (
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
