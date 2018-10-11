// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Modal, Tabs, Container } from 'react-bulma-components';
import { setFormData } from '../../../core/actions/modals/ImportFolder';
import AddTab from './AddTab';
import EditTab from './EditTab';
import type { FormType } from './Form';
import FixedPanel from '../../Panels/FixedPanel';

type Props = {
  status: boolean,
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
      const { formData } = this.props;
      formData({
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
      <Modal show={status} className="import-modal">
        <Modal.Content>
          <FixedPanel title="Manage import folders">
            <Container>
              <Tabs activeKey={activeTab} onSelect={this.onTabChange} id="import-modal-tabs">
                <Tabs.Tab
                  onClick={() => { this.onTabChange(1); }}
                  active={activeTab === 1}
                >Add new
                </Tabs.Tab>
                <Tabs.Tab
                  onClick={() => { this.onTabChange(2); }}
                  active={activeTab === 2}
                >Edit / Delete
                </Tabs.Tab>
              </Tabs>
              {activeTab === 1 && <AddTab />}
              {activeTab === 2 && <EditTab />}
            </Container>
          </FixedPanel>
        </Modal.Content>
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
