import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { forEach } from 'lodash';
import FixedPanel from '../../components/Panels/FixedPanel';
import ImportFolderSeriesItem from './ImportFolderSeriesItem';

class ImportFolderSeries extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    isFetching: PropTypes.bool,
    lastUpdated: PropTypes.number,
    items: PropTypes.object,
  };

  render() {
    const { items, isFetching, lastUpdated } = this.props;
    let folders = [];
    let i = 0;
    forEach(items, (item) => {
      i++;
      folders.push(<ImportFolderSeriesItem index={i} {...item} />);
    });

    return (
      <div className={this.props.className}>
        <FixedPanel
          title="Series In Import Folder"
          description="Use Import Folders section to manage"
          lastUpdated={lastUpdated}
          isFetching={isFetching}
          actionName="Sort"
        >
          <table className="table">
            <tbody>
            {folders}
            </tbody>
          </table>
        </FixedPanel>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { importFolderSeries } = state;
  const {
    isFetching,
    lastUpdated,
    items,
  } = importFolderSeries || {
    isFetching: true,
    items: [],
  };

  return {
    items,
    isFetching,
    lastUpdated,
  };
}

export default connect(mapStateToProps)(ImportFolderSeries);
