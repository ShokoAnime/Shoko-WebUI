// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { forEach } from 'lodash';
import FixedPanel from '../../components/Panels/FixedPanel';
import RecentFilesItem from './RecentFilesItem';
import type { RecentFileType } from './RecentFilesItem';

type Props = {
  items: Array<RecentFileType>
}

class RecentFiles extends React.Component<Props> {
  static propTypes = {
    items: PropTypes.object,
  };

  render() {
    const { items } = this.props;
    const files = [];
    let i = 0;
    forEach(items, (item) => {
      i += 1;
      files.push(<RecentFilesItem key={i} index={i} {...item} />);
    });
    return (
      <div className="recent-files">
        <FixedPanel title="Recent Files">
          <table className="table is-fullwidth is-striped is-hoverable">
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

  return {
    items: recentFiles,
  };
}

export default connect(mapStateToProps, () => ({}))(RecentFiles);
