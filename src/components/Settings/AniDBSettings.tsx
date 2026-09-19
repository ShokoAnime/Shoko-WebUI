import type { ChangeEventHandler, ReactNode } from 'react';

import Checkbox from '@/components/Input/Checkbox';
import InputSmall from '@/components/Input/InputSmall';
import SelectSmall from '@/components/Input/SelectSmall';
import UpdateFrequencyValues from '@/components/Settings/UpdateFrequencyValues';

import type { SettingsAnidbMyListType } from '@/core/types/api/settings';
import type { SettingsContextType } from '@/core/types/context';

type Props = Omit<SettingsContextType, 'setNewSettings'> & {
  isFirstRun?: boolean;
};

const Section = ({ children, isFirstRun, title }: {
  children: ReactNode;
  isFirstRun: boolean;
  title: string;
}) => {
  if (isFirstRun) {
    return (
      <>
        <div className="border-b-2 border-panel-border pb-4 font-semibold">{title}</div>
        <div className="flex flex-col gap-y-2">{children}</div>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-y-6">
        <div className="flex items-center font-semibold">{title}</div>
        <div className="flex flex-col gap-y-1">{children}</div>
      </div>
      <div className="border-b border-panel-border" />
    </>
  );
};

const AniDBSettings = (props: Props) => {
  const { isFirstRun = false, newSettings, updateSetting } = props;

  const {
    Anime_UpdateFrequency,
    Calendar_UpdateFrequency,
    DownloadCharacters,
    DownloadCreators,
    DownloadRelatedAnime,
    File_UpdateFrequency,
    MaxRelationDepth,
    MyList,
    Notification_HandleMovedFiles,
    Notification_UpdateFrequency,
  } = newSettings.AniDb;

  const {
    AddFiles,
    DeleteType,
    ReadUnwatched,
    ReadWatched,
    SetUnwatched,
    SetWatched,
    StorageState,
  } = MyList;

  const handleInputChange: ChangeEventHandler<HTMLInputElement | HTMLSelectElement> = (event) => {
    const value = event.target.type === 'checkbox' && 'checked' in event.target
      ? event.target.checked
      : event.target.value;
    updateSetting('AniDb', event.target.id, value);
  };

  const handleMyListChange: ChangeEventHandler<HTMLInputElement | HTMLSelectElement> = (event) => {
    const key = event.target.id as keyof SettingsAnidbMyListType;
    const value = event.target.type === 'checkbox' && 'checked' in event.target
      ? event.target.checked
      : event.target.value;
    updateSetting('AniDb', 'MyList', { ...MyList, [key]: value as SettingsAnidbMyListType[typeof key] });
  };

  return (
    <>
      <Section title="Download Options" isFirstRun={isFirstRun}>
        <Checkbox
          justify
          label="Character Images"
          id="DownloadCharacters"
          isChecked={DownloadCharacters}
          onChange={handleInputChange}
        />
        <Checkbox
          justify
          label="Creator Images"
          id="DownloadCreators"
          isChecked={DownloadCreators}
          onChange={handleInputChange}
        />
        <Checkbox
          justify
          label="Always Download Related Anime"
          id="DownloadRelatedAnime"
          isChecked={DownloadRelatedAnime}
          onChange={handleInputChange}
        />
        <div className="flex items-center justify-between transition-opacity">
          Related Depth
          <InputSmall
            id="MaxRelationDepth"
            value={MaxRelationDepth}
            type="number"
            min={0}
            max={5}
            onChange={handleInputChange}
            className="w-10 px-3 py-1 text-center"
          />
        </div>
      </Section>
      <Section title="MyList Options" isFirstRun={isFirstRun}>
        <Checkbox
          justify
          label="Add Files"
          id="AddFiles"
          isChecked={AddFiles}
          onChange={handleMyListChange}
        />
        <Checkbox
          justify
          label="Read Watched"
          id="ReadWatched"
          isChecked={ReadWatched}
          onChange={handleMyListChange}
        />
        <Checkbox
          justify
          label="Read Unwatched"
          id="ReadUnwatched"
          isChecked={ReadUnwatched}
          onChange={handleMyListChange}
        />
        <Checkbox
          justify
          label="Set Watched"
          id="SetWatched"
          isChecked={SetWatched}
          onChange={handleMyListChange}
        />
        <Checkbox
          justify
          label="Set Unwatched"
          id="SetUnwatched"
          isChecked={SetUnwatched}
          onChange={handleMyListChange}
        />
        <SelectSmall
          label="Storage State"
          id="StorageState"
          value={StorageState}
          onChange={handleMyListChange}
        >
          <option value="Unknown">Unknown</option>
          <option value="HDD">HDD</option>
          <option value="Disk">Disk</option>
          <option value="Deleted">Deleted</option>
          <option value="Remote">Remote</option>
        </SelectSmall>
        <SelectSmall
          label="Delete Action"
          id="DeleteType"
          value={DeleteType}
          onChange={handleMyListChange}
        >
          <option value="Delete">Delete File (AniDB)</option>
          <option value="DeleteLocalOnly">Delete File (Local)</option>
          <option value="MarkDeleted">Mark Deleted</option>
          <option value="MarkExternalStorage">Mark External (CD/DVD)</option>
          <option value="MarkUnknown">Mark Unknown</option>
          <option value="MarkDisk">DVD/BD</option>
        </SelectSmall>
      </Section>
      <Section title="Update Options" isFirstRun={isFirstRun}>
        <SelectSmall
          label="Calendar"
          id="Calendar_UpdateFrequency"
          value={Calendar_UpdateFrequency}
          onChange={handleInputChange}
        >
          <UpdateFrequencyValues min24Hours />
        </SelectSmall>
        <SelectSmall
          label="Anime Information"
          id="Anime_UpdateFrequency"
          value={Anime_UpdateFrequency}
          onChange={handleInputChange}
        >
          <UpdateFrequencyValues min24Hours />
        </SelectSmall>
        <SelectSmall
          label="Files With Missing Info"
          id="File_UpdateFrequency"
          value={File_UpdateFrequency}
          onChange={handleInputChange}
        >
          <UpdateFrequencyValues />
        </SelectSmall>
        <SelectSmall
          label="Notifications"
          id="Notification_UpdateFrequency"
          value={Notification_UpdateFrequency}
          onChange={handleInputChange}
        >
          <UpdateFrequencyValues />
        </SelectSmall>
        <Checkbox
          justify
          label="Handle Moved Files"
          id="Notification_HandleMovedFiles"
          isChecked={Notification_HandleMovedFiles}
          onChange={handleInputChange}
        />
      </Section>
    </>
  );
};

export default AniDBSettings;
