import store from './../../store';
import { setNotifications, setTheme } from './UI';
import { setLogDelta, setUpdateChannel } from './Other';
import { createAsyncStatelessGetAction, createAsyncStatelessPostAction, setGlobalAlert } from '../../actions';

export const getSettings = createAsyncStatelessGetAction('/webui/config', (response) => {
  response.json().then((json) => {
    if (json.code !== 200) {
      setGlobalAlert(json.message);
      return Promise.reject();
    }
    store.dispatch(setNotifications(json.uiNotifications));
    store.dispatch(setTheme(json.uiTheme));
    store.dispatch(setUpdateChannel(json.otherUpdateChannel));
    store.dispatch(setLogDelta(json.otherLogDelta));
    return Promise.resolve();
  });
});

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
