import enActions from './locales/en/actions.json';
import enCollection from './locales/en/collection.json';
import enComponents from './locales/en/components.json';
import enDashboard from './locales/en/dashboard.json';
import enDialogs from './locales/en/dialogs.json';
import enFiles from './locales/en/files.json';
import enLinks from './locales/en/links.json';
import enLogin from './locales/en/login.json';
import enPanels from './locales/en/panels.json';
import enPoster from './locales/en/poster.json';
import enSeries from './locales/en/series.json';
import enSetting from './locales/en/setting.json';
import enTopNav from './locales/en/topnav.json';
import enUtilities from './locales/en/utilities.json';
import zhActions from './locales/zh-CN/actions.json';
import zhCollection from './locales/zh-CN/collection.json';
import zhComponents from './locales/zh-CN/components.json';
import zhDashboard from './locales/zh-CN/dashboard.json';
import zhDialogs from './locales/zh-CN/dialogs.json';
import zhFiles from './locales/zh-CN/files.json';
import zhLinks from './locales/zh-CN/links.json';
import zhLogin from './locales/zh-CN/login.json';
import zhPanels from './locales/zh-CN/panels.json';
import zhPoster from './locales/zh-CN/poster.json';
import zhSeries from './locales/zh-CN/series.json';
import zhSetting from './locales/zh-CN/setting.json';
import zhTopNav from './locales/zh-CN/topnav.json';
import zhUtilities from './locales/zh-CN/utilities.json';

const resources = {
  en: {
    topNav: enTopNav,
    login: enLogin,
    series: enSeries,
    settings: enSetting,
    utilities: enUtilities,
    actions: enActions,
    components: enComponents,
    dialogs: enDialogs,
    panels: enPanels,
    files: enFiles,
    collection: enCollection,
    links: enLinks,
    dashboard: enDashboard,
    poster: enPoster,
  },
  'zh-CN': {
    topNav: zhTopNav,
    login: zhLogin,
    series: zhSeries,
    settings: zhSetting,
    utilities: zhUtilities,
    actions: zhActions,
    components: zhComponents,
    dialogs: zhDialogs,
    panels: zhPanels,
    files: zhFiles,
    collection: zhCollection,
    links: zhLinks,
    dashboard: zhDashboard,
    poster: zhPoster,
  },
};

export default resources;
