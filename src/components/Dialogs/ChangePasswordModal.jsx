// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { Modal, Container } from 'react-bulma-components';
import {
  Button, FormGroup, InputGroup,
} from '@blueprintjs/core';
import { connect } from 'react-redux';
import FixedPanel from '../Panels/FixedPanel';
import Events from '../../core/events';
import { setStatus } from '../../core/actions/modals/ChangePassword';

type passwordForm = {
  username: string,
  formData: {
    JMMUserID: number,
    password: string,
  },
}

type Props = {
  status: boolean,
  userid: number,
  username: string,
  handleClose: () => void,
  changePasswordSubmit: (payload: passwordForm) => void,
}

type State = {
  errorMessage: string | null,
}

class ChangePasswordModal extends React.Component<Props, State> {
  password: ?HTMLInputElement;

  confirmPassword: ?HTMLInputElement;

  static propTypes = {
    status: PropTypes.bool.isRequired,
    userid: PropTypes.number.isRequired,
    username: PropTypes.string.isRequired,
    changePasswordSubmit: PropTypes.func,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      errorMessage: null,
    };
  }

  handleChangePassword = () => {
    const {
      userid,
      username,
      changePasswordSubmit,
      handleClose,
    } = this.props;
    if (!this.password || !this.confirmPassword) { return; }
    const password = this.password.value;
    const confirmPassword = this.confirmPassword.value;
    if (password === '' || confirmPassword === '') { return; }
    if (password !== confirmPassword) { return; }
    changePasswordSubmit({
      username,
      formData: {
        JMMUserID: userid,
        password,
      },
    });
    handleClose();
  }

  handleOnChange = () => {
    if (!this.password || !this.confirmPassword) { return; }
    if (this.password.value !== this.confirmPassword.value) {
      this.setState({
        errorMessage: 'Passwords don\'t match!',
      });
    } else {
      this.setState({
        errorMessage: null,
      });
    }
  }

  render() {
    const { status, handleClose } = this.props;
    const { errorMessage } = this.state;

    return (
      <Modal show={status} onClose={handleClose}>
        <Modal.Content style={{ width: '20vw' }}>
          <FixedPanel title="Change Password">
            <Container>
              <div className="error-message">{errorMessage}</div>
              <FormGroup>
                <InputGroup type="password" inputRef={(ref) => { this.password = ref; }} onChange={this.handleOnChange} placeholder="New Password" />
              </FormGroup>
              <FormGroup>
                <InputGroup type="password" inputRef={(ref) => { this.confirmPassword = ref; }} onChange={this.handleOnChange} placeholder="Re-enter Password" />
              </FormGroup>
              <Button className="is-pulled-right" intent="primary" onClick={this.handleChangePassword}>Change</Button>
            </Container>
          </FixedPanel>
        </Modal.Content>
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  const { modals, apiSession } = state;
  const { changePassword } = modals;
  const { status } = changePassword;

  return {
    status,
    userid: apiSession.userid,
    username: apiSession.username,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    handleClose: () => dispatch(setStatus(false)),
    changePasswordSubmit: (payload) => { dispatch({ type: Events.CHANGE_PASSWORD, payload }); },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChangePasswordModal);
