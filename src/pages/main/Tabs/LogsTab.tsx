import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {
  List, AutoSizer, CellMeasurer, CellMeasurerCache,
} from 'react-virtualized';
import { RootState } from '../../../core/store';
import Events from '../../../core/events';

class LogsTab extends React.Component<Props> {
  cache = new CellMeasurerCache({
    fixedWidth: true,
    minHeight: 15,
  });

  componentDidMount = () => {
    const { load } = this.props;
    load();
  };

  renderRow = ({
    index, key, parent, style,
  }) => {
    const { lines } = this.props;

    return (
      <CellMeasurer
        cache={this.cache}
        columnIndex={0}
        key={key}
        rowIndex={index}
        parent={parent}
      >
        {({ registerChild }) => (
          <div ref={registerChild} key={key} style={style} className="text-sm bg-dark-gray">
            <div className="content flex flex-row">
              <div className="px-1 text-pink-500 whitespace-no-wrap">{lines[index].timeStamp}</div>
              <div className="px-1">{lines[index].message}</div>
            </div>
          </div>
        )}
      </CellMeasurer>
    );
  };

  render() {
    const { lines } = this.props;

    return (
      <React.Fragment>
        <div key="logs" className="bg-gray-700 text-white font-mono min-h-full overflow-x-hidden">
          {lines.length === 0 && <span key="empty">Nothing here. Make sure you have server version that supports log streaming.</span> }
          <AutoSizer>
            {({ width, height }) => (
              <List
                deferredMeasurementCache={this.cache}
                rowHeight={this.cache.rowHeight}
                width={width}
                height={height}
                rowRenderer={this.renderRow}
                rowCount={lines.length}
                overscanRowCount={0}
                scrollToIndex={lines.length}
              />
            )}
          </AutoSizer>
        </div>
      </React.Fragment>
    );
  }
}

const mapState = (state: RootState) => ({
  lines: state.logs.lines,
});

const mapDispatch = {
  load: () => ({ type: Events.LOGPAGE_LOAD }),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(LogsTab);
