import React from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { forEach } from 'lodash';

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

class ActionsTab extends React.Component {
  renderPanel = (action: any, key: string) => (
    <div key={key}>
      <QuickActions actions={action.data} title={action.title} />
    </div>
  );

  render() {
    const layout = {
      lg: [{
        i: 'anidb', x: 0, y: 0, w: 4, h: 9, minW: 3, minH: 5, maxH: 10,
      }, {
        i: 'shoko', x: 4, y: 0, w: 4, h: 9, minW: 3, minH: 5, maxH: 10,
      }, {
        i: 'import', x: 8, y: 0, w: 4, h: 9, minW: 3, minH: 5, maxH: 10,
      }, {
        i: 'moviedb', x: 0, y: 14, w: 4, h: 4, minW: 3, minH: 4, maxH: 10,
      }, {
        i: 'images', x: 4, y: 9, w: 4, h: 9, minW: 3, minH: 5, maxH: 10,
      }, {
        i: 'plex', x: 8, y: 9, w: 4, h: 4, minW: 3, minH: 4, maxH: 10,
      }, {
        i: 'trakt', x: 8, y: 14, w: 4, h: 5, minW: 3, minH: 5, maxH: 10,
      }, {
        i: 'tvdb', x: 0, y: 9, w: 4, h: 5, minW: 3, minH: 5, maxH: 10,
      }],
    };

    const cols = {
      lg: 12, md: 10, sm: 6, xs: 4, xxs: 2,
    };

    const containerPadding = [40, 40] as [number, number];

    const margin = [40, 40] as [number, number];

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
          containerPadding={containerPadding}
          margin={margin}
          className="w-full"
        >
          {panels}
        </ResponsiveGridLayout>
      </React.Fragment>
    );
  }
}

export default ActionsTab;
