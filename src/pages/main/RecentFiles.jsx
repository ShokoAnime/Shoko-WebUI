// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { forEach } from 'lodash';
import FixedPanel from '../../components/Panels/FixedPanel';
import RecentFilesItem from './RecentFilesItem';
import type { RecentFileType } from './RecentFilesItem';

type Props = {
  className: string,
  items: Array<RecentFileType>
}

class RecentFiles extends React.Component<Props> {
  static propTypes = {
    className: PropTypes.string,
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
      <div className={this.props.className}>
        <FixedPanel
          title="Recent Files"
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

  return {
    items: recentFiles,
  };
}

export default connect(mapStateToProps, () => ({}))(RecentFiles);
