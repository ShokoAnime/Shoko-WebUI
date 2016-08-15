import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { forEach } from 'lodash';
import FixedPanel from '../../components/Panels/FixedPanel';
import ImportFoldersItem from './ImportFoldersItem';
import ImportModal from '../../components/Dialogs/ImportModal';

class ImportFolders extends React.Component {
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
      folders.push(<ImportFoldersItem index={i} {...item} />);
    });

    return (
      <div className={this.props.className}>
        <FixedPanel
          title="Import Folders Overview"
          description="Use Import Folders section to manage"
          lastUpdated={lastUpdated}
          isFetching={isFetching}
        >
          <table className="table">
            <tbody>
            {folders}
            </tbody>
          </table>
        </FixedPanel>
        <ImportModal show />
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { importFolders } = state;
  const {
    isFetching,
    lastUpdated,
    items,
  } = importFolders || {
    isFetching: true,
    items: [],
  };

  return {
    items,
    isFetching,
    lastUpdated,
  };
}

export default connect(mapStateToProps)(ImportFolders);
