import React, { useEffect, useState } from 'react';
import { mdiMagnify, mdiPencilCircleOutline } from '@mdi/js';

import Input from '@/components/Input/Input';
import { useGetSeriesQuery } from '@/core/rtkQuery/splitV3Api/seriesApi';

type Props = {
  seriesId: number;
};

const NameTab = ({ seriesId }: Props) => {
  const [name, setName] = useState('');
  const [search, setSearch] = useState('');
  const [nameEditable, setNameEditable] = useState(false);

  const seriesQuery = useGetSeriesQuery({ seriesId: seriesId.toString(), includeDataFrom: ['AniDB'] }, {
    refetchOnMountOrArgChange: false,
  });

  useEffect(() => {
    setName(seriesQuery.data?.Name ?? '');
  }, [seriesQuery]);

  return (
    <div className="flex flex-col">
      <Input
        id="name"
        type="text"
        onChange={e => setName(e.target.value)}
        value={name}
        label="Name"
        className="mb-4"
        endIcon={mdiPencilCircleOutline}
        endIconClick={() => setNameEditable(true)}
        disabled={!nameEditable}
      />
      <Input
        id="search"
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        startIcon={mdiMagnify}
        placeholder="Name Search..."
        disabled
        // TODO: Implement
      />
      <div className="mt-1 flex flex-col gap-y-2.5 rounded-md border border-panel-border bg-panel-background-alt p-4">
        {seriesQuery.data?.AniDB?.Titles.map(title => (
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
  );
};

export default NameTab;
