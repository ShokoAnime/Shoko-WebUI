import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Responsive, WidthProvider } from 'react-grid-layout';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import type { layoutType } from '../../../core/slices/webuiSettings';
import { defaultLayout } from '../../../core/slices/webuiSettings';

import AniDBSettings from '../Panels/AniDBSettings';
import AniDBLoginSettings from '../Panels/AniDBLoginSettings';
import GeneralSettings from '../Panels/GeneralSettings';
import MovieDBSettings from '../Panels/MovieDBSettings';
import TvDBSettings from '../Panels/TvDBSettings';

const ResponsiveGridLayout = WidthProvider(Responsive);

type State = layoutType;

class SettingsTab extends React.Component<Props, State> {
  state = defaultLayout.settings;

  componentDidMount = () => {
    const { layout } = this.props;
    this.setState(layout);
  };

  handleOnLayoutChange = (layout: any) => {
    const { fetched, changeLayout } = this.props;
    this.setState(layout);
    if (fetched) {
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
          <div key="tvdb">
            <TvDBSettings />
          </div>
          <div key="moviedb">
            <MovieDBSettings />
          </div>
          <div key="anidb-login">
            <AniDBLoginSettings />
          </div>
        </ResponsiveGridLayout>
      </React.Fragment>
    );
  }
}

const mapState = (state: RootState) => ({
  layout: state.webuiSettings.layout.settings,
  fetched: state.mainpage.fetched.settings,
});

const mapDispatch = {
  changeLayout: (layout: any) => ({
    type: Events.SETTINGS_SAVE_WEBUI_LAYOUT,
    payload: { settings: layout },
  }),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(SettingsTab);
