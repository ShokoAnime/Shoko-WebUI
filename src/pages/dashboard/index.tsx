
import React from 'react';
import { connect } from 'react-redux';
import { Responsive, WidthProvider } from 'react-grid-layout';
import Events from '../../core/events';
import Layout from '../../components/Layout/Layout';
import CollectionBreakdown from './CollectionBreakdown';
import SeriesBreakdown from './SeriesBreakdown';
import ImportBreakdown from './ImportBreakdown';
import FilesBreakdown from './FilesBreakdown';
import ActionItems from './ActionItems';
import ImportFolders from './ImportFolders';
import { State } from '../../core/store';
import CommandQueue from './CommandQueue';

type Props = {
  autoUpdate: any;
  stopPolling: () => void;
  load: () => void;
};

const ResponsiveGridLayout = WidthProvider(Responsive);

class MainPage extends React.Component<Props> {
  componentDidMount() {
    const {
      load,
    } = this.props;
    load();
  }

  componentWillUnmount() {
    const {
      autoUpdate,
      stopPolling,
    } = this.props;
    if (autoUpdate) {
      stopPolling();
    }
  }

  render() {
    const layout = {
      lg: [{
        i: 'collectionBreakdown', x: 0, y: 0, w: 12, h: 6, minW: 9, minH: 6, maxH: 8,
      }, {
        i: 'seriesBreakdown', x: 12, y: 0, w: 12, h: 6, minW: 9, minH: 6, maxH: 8,
      }, {
        i: 'commandQueue', x: 0, y: 6, w: 15, h: 11, minW: 5, minH: 5,
      }, {
        i: 'importFolders', x: 15, y: 6, w: 9, h: 11,
      }, {
        i: 'importBreakdown', x: 0, y: 17, w: 12, h: 11,
      },
      {
        i: 'actionItems', x: 12, y: 17, w: 6, h: 11,
      }, {
        i: 'filesBreakdown', x: 18, y: 17, w: 6, h: 11,
      }],
    };

    const cols = {
      lg: 24, md: 10, sm: 6, xs: 4, xxs: 2,
    };

    const containerPadding = [40, 40] as [number, number];

    const margin = [40, 40] as [number, number];

    return (
      <Layout>
        <ResponsiveGridLayout
          layouts={layout}
          cols={cols}
          rowHeight={0}
          containerPadding={containerPadding}
          margin={margin}
        >
          <div key="collectionBreakdown">
            <CollectionBreakdown />
          </div>
          <div key="seriesBreakdown">
            <SeriesBreakdown />
          </div>
          <div key="commandQueue">
            <CommandQueue />
          </div>
          <div key="importFolders">
            <ImportFolders />
          </div>
          <div key="importBreakdown">
            <ImportBreakdown />
          </div>
          <div key="actionItems">
            <ActionItems />
          </div>
          <div key="filesBreakdown">
            <FilesBreakdown />
          </div>
        </ResponsiveGridLayout>
      </Layout>
    );
  }
}

function mapStateToProps(state: State) {
  const {
    autoUpdate,
  } = state;

  return {
    autoUpdate,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    stopPolling: () => dispatch({
      type: Events.STOP_API_POLLING,
      payload: { type: 'auto-refresh' },
    }),
    load: () => dispatch({ type: Events.DASHBOARD_LOAD, payload: null }),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MainPage);
