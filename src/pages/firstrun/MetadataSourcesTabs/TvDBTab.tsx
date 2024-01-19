import React from 'react';
import cx from 'classnames';

import Checkbox from '@/components/Input/Checkbox';
import InputSmall from '@/components/Input/InputSmall';
import SelectSmall from '@/components/Input/SelectSmall';
import TvdbLanguageSelect from '@/components/Settings/TvdbLanguageSelect';
import TransitionDiv from '@/components/TransitionDiv';
import useFirstRunSettingsContext from '@/hooks/UseFirstRunSettingsContext';

function TvDBTab() {
  const { newSettings, updateSetting } = useFirstRunSettingsContext();

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement> = (event) => {
    const propId = event.target.id.replace('TvDB_', '');
    const value = event.target.type === 'checkbox' && 'checked' in event.target
      ? event.target.checked
      : event.target.value;
    updateSetting('TvDB', propId, value);
  };

  const {
    AutoFanart,
    AutoFanartAmount,
    AutoLink,
    AutoPosters,
    AutoPostersAmount,
    AutoWideBanners,
    AutoWideBannersAmount,
    Language,
    UpdateFrequency,
  } = newSettings.TvDB;

  const renderUpdateFrequencyValues = () => (
    <>
      <option value={1}>Never</option>
      <option value={2}>Every 6 Hours</option>
      <option value={3}>Every 12 Hours</option>
      <option value={4}>Every 24 Hours</option>
      <option value={5}>Once a Week</option>
      <option value={6}>Once a Month</option>
    </>
  );

  return (
    <TransitionDiv className="flex flex-col gap-y-8">
      <div className="border-b-2 border-panel-border pb-4 font-semibold">Download Options</div>
      <div className="flex flex-col gap-y-2">
        <Checkbox
          label="Fanart"
          id="TvDB_AutoFanart"
          isChecked={AutoFanart}
          onChange={handleInputChange}
          justify
        />
        <div className={cx('flex justify-between transition-opacity', !AutoFanart && 'pointer-events-none opacity-65')}>
          Max Fanart
          <InputSmall
            id="TvDB_AutoFanartAmount"
            value={AutoFanartAmount}
            type="text"
            onChange={handleInputChange}
            className="w-10 px-2 py-0.5"
          />
        </div>
        <Checkbox
          label="Posters"
          id="TvDB_AutoPosters"
          isChecked={AutoPosters}
          onChange={handleInputChange}
          justify
          className="mt-1"
        />
        <div
          className={cx('flex justify-between transition-opacity', !AutoPosters && 'pointer-events-none opacity-65')}
        >
          Max Posters
          <InputSmall
            id="TvDB_AutoPostersAmount"
            value={AutoPostersAmount}
            type="text"
            onChange={handleInputChange}
            className="w-10 px-2 py-0.5"
          />
        </div>
        <Checkbox
          label="Wide Banners"
          id="TvDB_AutoWideBanners"
          isChecked={AutoWideBanners}
          onChange={handleInputChange}
          justify
        />
        <div
          className={cx(
            'flex justify-between transition-opacity',
            !AutoWideBanners && 'pointer-events-none opacity-65',
          )}
        >
          Max Wide Banners
          <InputSmall
            id="TvDB_AutoWideBannersAmount"
            value={AutoWideBannersAmount}
            type="text"
            onChange={handleInputChange}
            className="w-10 px-2 py-0.5"
          />
        </div>
      </div>

      <div className="border-b-2 border-panel-border pb-4 font-semibold">Preferences</div>
      <div className="flex flex-col gap-y-2">
        <Checkbox
          label="Auto Link"
          id="TvDB_AutoLink"
          isChecked={AutoLink}
          onChange={handleInputChange}
          justify
        />
        <TvdbLanguageSelect label="Language" id="TvDB_Language" value={Language} onChange={handleInputChange} />
        <SelectSmall
          label="Automatically Update Stats"
          id="UpdateFrequency"
          value={UpdateFrequency}
          onChange={handleInputChange}
        >
          {renderUpdateFrequencyValues()}
        </SelectSmall>
      </div>
    </TransitionDiv>
  );
}

export default TvDBTab;
