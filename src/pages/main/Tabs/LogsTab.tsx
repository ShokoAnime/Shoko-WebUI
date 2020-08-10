import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { List, AutoSizer } from 'react-virtualized';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { forEach, isEqual, isUndefined } from 'lodash';
import { defaultLayout, layoutType } from '../../../core/slices/webuiSettings';
import { omitDeepBy } from '../../../core/util';
import { RootState } from '../../../core/store';
import Events from '../../../core/events';

const ResponsiveGridLayout = WidthProvider(Responsive);
type State = layoutType;

class LogsTab extends React.Component<Props, State> {
  state = defaultLayout.logs;

  componentDidMount = () => {
    const { layout, load } = this.props;
    this.setState(layout);
    load();
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

  renderRow = ({ index, key, style }) => {
    const { lines } = this.props;

    return (
      <div key={key} style={style} className="row">
        <div className="content">
          <div>{lines[index].timestamp}</div>
          <div>{lines[index].message}</div>
        </div>
      </div>
    );
  };

  render() {
    const cols = {
      lg: 12, md: 10, sm: 6, xs: 4, xxs: 2,
    };

    const { lines } = this.props;

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
          <div key="logs">
            <AutoSizer>
              {({ width, height }) => (
                <List
                  width={width}
                  height={height}
                  rowHeight={60}
                  rowRenderer={this.renderRow}
                  rowCount={lines.length}
                  overscanRowCount={3}
                  scrollToIndex={lines.length}
                />
              )}
            </AutoSizer>
          </div>
        </ResponsiveGridLayout>
      </React.Fragment>
    );
  }
}

const mapState = (state: RootState) => ({
  layout: state.webuiSettings.v3.layout.logs,
  lines: state.logs.lines,
});

const mapDispatch = {
  changeLayout: (layout: any) => ({
    type: Events.SETTINGS_SAVE_WEBUI_LAYOUT,
    payload: { actions: layout },
  }),
  load: () => ({ type: Events.LOGPAGE_LOAD }),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(LogsTab);
