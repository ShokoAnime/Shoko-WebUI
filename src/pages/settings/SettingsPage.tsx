import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { isEqual, isUndefined } from 'lodash';
import { omitDeepBy } from '../../core/util';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import type { LayoutType } from '../../core/slices/webuiSettings';
import { defaultLayout } from '../../core/slices/webuiSettings';

import AniDBSettings from './panels/AniDBSettings';
import AniDBLoginSettings from './panels/AniDBLoginSettings';
import GeneralSettings from './panels/GeneralSettings';
import ImportSettings from './panels/ImportSettings';
import LanguageSettings from './panels/LanguageSettings';
import MovieDBSettings from './panels/MovieDBSettings';
import PlexSettings from './panels/PlexSettings';
import RelationSettings from './panels/RelationSettings';
import TraktSettings from './panels/TraktSettings';
import TvDBSettings from './panels/TvDBSettings';

const ResponsiveGridLayout = WidthProvider(Responsive);

type State = LayoutType;

class SettingsPage extends React.Component<Props, State> {
  state = defaultLayout.settings;

  componentDidMount = () => {
    const { layout, checkWebUIUpdate } = this.props;
    this.setState(layout);
    checkWebUIUpdate();
  };

  componentDidUpdate = (prevProps) => {
    const { layout } = this.props;
    if (!isEqual(prevProps, this.props)) this.setState(layout);
  };

  handleOnLayoutChange = (layout: any) => {
    const { changeLayout } = this.props;
    if (!isEqual(this.state, omitDeepBy(layout, isUndefined))) {
      changeLayout(layout);
    }
  };

  render() {
    const cols = {
      lg: 12, md: 10, sm: 6, xs: 4, xxs: 2,
    };

    return (
      <React.Fragment>
        <ResponsiveGridLayout
          layouts={this.state}
          cols={cols}
          rowHeight={0}
          containerPadding={[40, 40]}
          margin={[40, 40]}
          className="w-full"
          onLayoutChange={(_layout, layouts) => this.handleOnLayoutChange(layouts)}
        >
          <div key="general">
            <GeneralSettings />
          </div>
          <div key="anidb">
            <AniDBSettings />
          </div>
          <div key="relation">
            <RelationSettings />
          </div>
          <div key="tvdb">
            <TvDBSettings />
          </div>
          <div key="moviedb">
            <MovieDBSettings />
          </div>
          <div key="anidb-login">
            <AniDBLoginSettings />
          </div>
          <div key="plex">
            <PlexSettings />
          </div>
          <div key="trakt">
            <TraktSettings />
          </div>
          <div key="language">
            <LanguageSettings />
          </div>
          <div key="import">
            <ImportSettings />
          </div>
        </ResponsiveGridLayout>
      </React.Fragment>
    );
  }
}

const mapState = (state: RootState) => ({
  layout: state.webuiSettings.v3.layout.settings,
});

const mapDispatch = {
  changeLayout: (layout: any) => ({
    type: Events.SETTINGS_SAVE_WEBUI_LAYOUT,
    payload: { settings: layout },
  }),
  checkWebUIUpdate: () => ({ type: Events.WEBUI_CHECK_UPDATES }),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(SettingsPage);
