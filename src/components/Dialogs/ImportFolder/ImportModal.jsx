// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
  Modal,
  Tabs,
  Tab,
  Panel,
} from 'react-bootstrap';
import cx from 'classnames';
import { setFormData } from '../../../core/actions/modals/ImportFolder';
import s from '../ImportModal.css';
import AddTab from './AddTab';
import EditTab from './EditTab';
import type { FormType } from './Form';

type Props = {
  status: bool,
  formData: (FormType) => void,
}

type State = {
  activeTab: number,
}

class ImportModal extends React.Component<Props, State> {
  static propTypes = {
    status: PropTypes.bool,
    formData: PropTypes.func.isRequired,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      activeTab: 1,
    };
  }

  onTabChange = (id: number) => {
    if (id === 1) {
      this.props.formData({
        ImportFolderID: null,
        ImportFolderType: '1',
        ImportFolderName: '',
        ImportFolderLocation: '',
        IsDropSource: 0,
        IsDropDestination: 0,
        IsWatched: 0,
      });
    }
    this.setState({ activeTab: id });
  };

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

function mapDispatchToProps(dispatch) {
  return {
    formData: value => dispatch(setFormData(value)),
  };
}

export default connect(undefined, mapDispatchToProps)(ImportModal);
