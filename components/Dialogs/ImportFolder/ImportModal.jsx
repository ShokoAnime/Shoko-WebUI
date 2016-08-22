import React, { PropTypes } from 'react';
import {
  Modal,
  Tabs,
  Tab,
  Panel,
} from 'react-bootstrap';
import cx from 'classnames';
import store from '../../../core/store';
import { setFormData } from '../../../core/actions/modals/ImportFolder';
import s from '../ImportModal.css';
import AddTab from './AddTab';
import EditTab from './EditTab';

class ImportModal extends React.Component {
  static propTypes = {
    status: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.onTabChange = this.onTabChange.bind(this);
    this.state = {
      activeTab: 1,
    };
  }

  onTabChange(id) {
    if (id === 1) {
      store.dispatch(setFormData({
        ImportFolderID: null,
        ImportFolderType: '1',
        ImportFolderName: '',
        ImportFolderLocation: '',
        IsDropSource: 0,
        IsDropDestination: 0,
        IsWatched: 0,
      }));
    }
    this.setState({ activeTab: id });
  }

  render() {
    const { status } = this.props;
    const { activeTab } = this.state;

    return (
      <Modal show={status} className={cx(s.modal, s['import-modal'])}>
        <Panel header="Manage import folders">
          <Tabs activeKey={activeTab} onSelect={this.onTabChange} id="import-modal-tabs">
            <Tab eventKey={1} title="Add new"><AddTab /></Tab>
            <Tab eventKey={2} title="Edit / Delete" ><EditTab /></Tab>
            <Tab eventKey={3} title="Providers" disabled />
          </Tabs>
        </Panel>
      </Modal>
    );
  }
}

export default ImportModal;
