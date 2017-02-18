import { createAction } from 'redux-actions';
import store from './../../store';
import { createAsyncStatelessPostAction, setGlobalAlert } from '../../actions';

export const SETTINGS_API_GET = 'SETTINGS_API_GET';
export const getSettings = createAction(SETTINGS_API_GET);

const prepareSettings = () => {
  const action = createAsyncStatelessPostAction('/webui/config', (response) => {
    response.json().then((json) => {
      if (json.code !== 200) {
        setGlobalAlert(json.message);
        return Promise.reject();
      }
      return Promise.resolve();
    });
  });

  return (data) => {
    const state = store.getState();
    const settings = {
      uiTheme: state.settings.ui.theme,
      uiNotifications: state.settings.ui.notifications,
      otherUpdateChannel: state.settings.other.updateChannel,
      otherLogDelta: state.settings.other.logDelta,
    };
    return action(Object.assign({}, settings, data));
  };
};

export const setSettings = prepareSettings();
