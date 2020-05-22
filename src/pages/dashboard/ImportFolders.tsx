
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import prettyBytes from 'pretty-bytes';
import { forEach } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSquare, faEdit, faServer, faSearch,
} from '@fortawesome/free-solid-svg-icons';
import Events from '../../core/events';
import FixedPanel from '../../components/Panels/FixedPanel';
import Button from '../../components/Buttons/Button';

type ImportFolderType= {
  ID: number;
  WatchForNewFiles?: boolean;
  DropFolderType?: number;
  Path: string;
  FileSize?: number;
  Name: string;
  Size?: number;
};

type StateProps = {
  importFolders?: Array<ImportFolderType>;
};

type DispatchProps = {
  rescanFolder?: (payload: number) => void;
};

type Props = StateProps & DispatchProps;

class ImportFolders extends React.Component<Props> {
  static propTypes = {
    importFolders: PropTypes.array,
    rescanFolder: PropTypes.func,
  };

  renderType = (ID: number, dropFolderType = 0, watchForNewFiles = false) => {
    let flags = '';

    if (dropFolderType === 1) flags = 'Drop Source'; else if (dropFolderType === 2) flags = 'Drop Destination';

    if (watchForNewFiles) {
      flags += dropFolderType ? ', Watch For New Files' : 'Watch For New Files';
    }

    return (
      <tr key={`${ID}-type`} className="font-muli font-bold">
        <td className="py-2 w-10/12">{flags}</td>
        <td className="py-2 color-accent w-2/12" align="right">
          <span className="mx-2">Online</span>
        </td>
      </tr>
    );
  };

  renderPath = (ID: number, Path: string) => {
    const { rescanFolder } = this.props;
    return (
      <tr key={`${ID}-path`}>
        <td className="pb-2 w-10/12">{Path}</td>
        <td className="pb-2 w-2/12 align-middle" align="right" rowSpan={2}>
          <Button className="color-accent mx-2" onClick={() => rescanFolder!(ID)}>
            <span className="fa-layers fa-fw">
              <FontAwesomeIcon icon={faServer} />
              <FontAwesomeIcon icon={faSquare} transform="shrink-5 down-2 right-6" className="fa-layer-icon-bg" />
              <FontAwesomeIcon icon={faSearch} transform="shrink-6 down-2.75 right-6" />
            </span>
          </Button>
          <Button className="color-accent mx-2" onClick={() => {}}>
            <FontAwesomeIcon icon={faEdit} />
          </Button>
        </td>
      </tr>
    );
  };

  renderSize = (ID: number, FileSize = 0, Size = 0) => (
    <tr key={`${ID}-size`}>
      <td className="pb-2">
        Series: {Size} / Size: {prettyBytes(FileSize)}
      </td>
    </tr>
  );

  render() {
    const { importFolders } = this.props;

    const items: any[] = [];

    forEach(importFolders, (folder: ImportFolderType) => {
      items.push(this.renderType(folder.ID, folder.DropFolderType, folder.WatchForNewFiles));
      items.push(this.renderPath(folder.ID, folder.Path));
      items.push(this.renderSize(folder.ID, folder.FileSize, folder.Size));
    });

    return <FixedPanel title="Import Folders">{items}</FixedPanel>;
  }
}

function mapStateToProps(state): StateProps {
  const {
    importFolders,
  } = state;

  return {
    importFolders: importFolders || [],
  };
}

function mapDispatchToProps(dispatch): DispatchProps {
  return {
    rescanFolder: (payload) => {
      dispatch({ type: Events.IMPORT_FOLDER_RESCAN, payload });
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ImportFolders);
