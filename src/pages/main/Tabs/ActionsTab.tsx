import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { forEach } from 'lodash';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import QuickActions from '../Panels/QuickActions';

const ResponsiveGridLayout = WidthProvider(Responsive);

const actions = {
  anidb: {
    title: 'AniDB',
    data: [
      'download-missing-anidb-data',
      'sync-votes',
      'sync-mylist',
      'update-all-anidb-info',
    ],
  },
  trakt: {
    title: 'Trakt',
    data: [
      'sync-trakt',
      'update-all-trakt-info',
    ],
  },
  tvdb: {
    title: 'The TvDB',
    data: [
      'regen-tvdb-links',
      'update-all-tvdb-info',
    ],
  },
  moviedb: {
    title: 'The MovieDB',
    data: [
      'update-all-moviedb-info',
    ],
  },
  shoko: {
    title: 'Shoko',
    data: [
      'avdump-mismatched-files',
      'sync-hashes',
      'update-all-mediainfo',
      'update-series-stats',
    ],
  },
  images: {
    title: 'Images',
    data: [
      'update-all-images',
      'validate-all-images',
    ],
  },
  plex: {
    title: 'Plex',
    data: [
      'plex-sync-all',
    ],
  },
  import: {
    title: 'Import',
    data: [
      'remove-missing-files-mylist',
      'remove-missing-files',
      'run-import',
    ],
  },
};

class ActionsTab extends React.Component<Props> {
  handleOnLayoutChange = (layout: any) => {
    const { fetched, changeLayout } = this.props;
    if (fetched) {
      changeLayout(layout);
    }
  };

  renderPanel = (action: any, key: string) => (
    <div key={key}>
      <QuickActions actions={action.data} title={action.title} />
    </div>
  );

  render() {
    const { layout } = this.props;

    const cols = {
      lg: 12, md: 10, sm: 6, xs: 4, xxs: 2,
    };

    const panels: Array<any> = [];

    forEach(actions, (action, key) => {
      panels.push(this.renderPanel(action, key));
    });

    return (
      <React.Fragment>
        <ResponsiveGridLayout
          layouts={layout}
          cols={cols}
          rowHeight={0}
          containerPadding={[40, 40]}
          margin={[40, 40]}
          className="w-full"
        >
          {panels}
        </ResponsiveGridLayout>
      </React.Fragment>
    );
  }
}

const mapState = (state: RootState) => ({
  layout: state.webuiSettings.layout.actions,
  fetched: state.mainpage.fetched.settings,
});

const mapDispatch = {
  changeLayout: (layout: any) => ({
    type: Events.SETTINGS_SAVE_WEBUI_LAYOUT,
    payload: { actions: layout },
  }),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(ActionsTab);
