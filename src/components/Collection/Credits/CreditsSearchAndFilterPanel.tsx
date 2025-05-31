import React from 'react';
import { mdiInformationOutline, mdiMagnify, mdiPlayCircleOutline } from '@mdi/js';
import Icon from '@mdi/react';

import Checkbox from '@/components/Input/Checkbox';
import Input from '@/components/Input/Input';
import ShokoPanel from '@/components/Panels/ShokoPanel';

type Props = {
  inputPlaceholder: string;
  search: string;
  handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  roleFilter: Set<string>;
  handleFilterChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uniqueRoles: string[];
  refreshAniDbAction: () => void;
  aniDbRefreshing: boolean;
};
const CreditsSearchAndFilterPanel = React.memo(
  (
    {
      aniDbRefreshing,
      handleFilterChange,
      handleSearchChange,
      inputPlaceholder,
      refreshAniDbAction,
      roleFilter,
      search,
      uniqueRoles,
    }: Props,
  ) => (
    <ShokoPanel
      title="Search & Filter"
      className="w-100"
      contentClassName="gap-y-6"
      sticky
      transparent
      fullHeight={false}
    >
      <div className="flex flex-col gap-y-2">
        <span className="flex w-full text-base font-semibold">
          Name
        </span>
        <Input
          id="search"
          startIcon={mdiMagnify}
          type="text"
          placeholder={inputPlaceholder}
          value={search}
          inputClassName="px-4 py-3"
          onChange={handleSearchChange}
        />
      </div>
      <div className="flex flex-col gap-y-2">
        <div className="text-base font-semibold">Roles</div>
        <div className="flex flex-col gap-y-2 rounded-lg bg-panel-input p-6">
          {uniqueRoles.map(desc => (
            <Checkbox
              justify
              label={desc}
              key={desc}
              id={desc}
              isChecked={!roleFilter.has(desc)}
              onChange={handleFilterChange}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-y-2">
        <div className="text-base font-semibold">Quick Actions</div>
        <button
          type="button"
          className="flex w-full flex-row justify-between disabled:cursor-not-allowed disabled:opacity-65"
          onClick={refreshAniDbAction}
          disabled={aniDbRefreshing}
        >
          Force refresh: AniDB
          <Icon
            path={mdiPlayCircleOutline}
            className="pointer-events-auto text-panel-icon-action group-disabled:cursor-not-allowed"
            size={1}
          />
        </button>
      </div>
      <hr className="border border-panel-border" />
      <div className="flex flex-row gap-x-3">
        <Icon path={mdiInformationOutline} className="text-panel-icon-warning" size={1} />
        <div className="grow text-base font-semibold">
          Warning! Possible Spoilers
        </div>
      </div>
    </ShokoPanel>
  ),
);

export default CreditsSearchAndFilterPanel;
