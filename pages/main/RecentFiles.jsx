import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { forEach } from 'lodash';
import FixedPanel from '../../components/Panels/FixedPanel';
import RecentFilesItem from './RecentFilesItem';

class RecentFiles extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    isFetching: PropTypes.bool,
    lastUpdated: PropTypes.number,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        path: PropTypes.string,
        success: PropTypes.bool,
      })
    ),
  };

  render() {
    const { items, isFetching, lastUpdated } = this.props;
    const files = [];
    let i = 0;
    forEach(items, (item) => {
      i++;
      files.push(<RecentFilesItem index={i} {...item} />);
    });
    return (
      <div className={this.props.className}>
        <FixedPanel
          title="Recent Files"
          lastUpdated={lastUpdated}
          isFetching={isFetching}
          description="List of recently added files and their import status"
        >
          <table className="table">
            <tbody>
            {files}
            </tbody>
          </table>
        </FixedPanel>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { recentFiles } = state;
  const {
    isFetching,
    lastUpdated,
    items,
  } = recentFiles || {
    isFetching: true,
    items: [],
  };

  return {
    items,
    isFetching,
    lastUpdated,
  };
}

export default connect(mapStateToProps)(RecentFiles);
