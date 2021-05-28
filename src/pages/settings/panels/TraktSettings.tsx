import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import FixedPanel from '../../../components/Panels/FixedPanel';
import Button from '../../../components/Input/Button';
import Checkbox from '../../../components/Input/Checkbox';
import SelectSmall from '../../../components/Input/SelectSmall';

import { setItem as setMiscItem } from '../../../core/slices/misc';

const updateFrequencyType = [
  [1, 'Never'],
  [2, 'Every 6 Hours'],
  [3, 'Every 12 Hours'],
  [4, 'Every 24 Hours'],
  [5, 'Once a Week'],
  [6, 'Once a Month'],
];

function TraktSettings() {
  const dispatch = useDispatch();

  const isFetchingSettings = useSelector((state: RootState) => state.fetching.settings);
  const isFetchingTraktCode = useSelector((state: RootState) => state.fetching.trakt_code);
  const traktSettings = useSelector((state: RootState) => state.localSettings.TraktTv);
  const traktValues = useSelector((state: RootState) => state.misc.trakt);

  const saveSettings = (newSettings: { [id: string]: any }) => dispatch(
    { type: Events.SETTINGS_SAVE_SERVER, payload: { context: 'TraktTv', newSettings } },
  );

  useEffect(() => {
    dispatch(setMiscItem({ trakt: { usercode: '', url: '' } }));
  }, []);

  const handleInputChange = (event: any) => {
    const propId = event.target.id.replace('Trakt_', '');
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    if (value !== '') {
      saveSettings({ [propId]: value });
    }
  };

  const renderTraktCode = () => {
    if (traktValues.usercode === '') {
      return (
        <div className="flex justify-between items-center mt-1">
          Trakt Code
          <Button onClick={() => dispatch({ type: Events.SETTINGS_GET_TRAKT_CODE })} className="bg-color-highlight-1 px-2 py-1 text-xs">
            {isFetchingTraktCode ? 'Requesting...' : 'Get Code'}
          </Button>
        </div>
      );
    }
    return (
      <div className="flex justify-between mt-1 items-center">
        <div className="flex">
          Trakt Code:<span className="font-bold ml-1">{traktValues.usercode}</span>
        </div>
        <a href={traktValues.url} rel="noopener noreferrer" target="_blank" className="color-highlight-2 hover:underline">Click here to activate</a>
      </div>
    );
  };

  return (
    <FixedPanel title="Trakt" isFetching={isFetchingSettings}>
      <Checkbox label="Enabled" id="Trakt_Enabled" isChecked={traktSettings.Enabled} onChange={handleInputChange} />
      {traktSettings.Enabled && (
        traktSettings.TokenExpirationDate === ''
          ? renderTraktCode()
          : (
            <div className="flex justify-between mt-1">
              Token valid until:
              <span className="text-right">{moment(traktSettings.TokenExpirationDate, 'X').format('MMM Do YYYY, h:mm A')}</span>
            </div>
          )
      )}
      {traktSettings.Enabled && traktSettings.TokenExpirationDate !== '' && (
        <SelectSmall label="Automatically Update Data" id="UpdateFrequency" value={traktSettings.UpdateFrequency} onChange={handleInputChange} className="mt-1">
          {updateFrequencyType.map(
            item => (<option value={item[0]} key={item[0]}>{item[1]}</option>),
          )}
        </SelectSmall>
      )}
    </FixedPanel>
  );
}

export default TraktSettings;
