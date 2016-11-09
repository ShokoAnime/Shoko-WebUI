import React, { PropTypes } from 'react';
import cx from 'classnames';
import { Modal, Alert } from 'react-bootstrap';
import history from '../../core/history';
import { updateWebuiAsync, updateWebui } from '../../core/actions';

class UpdateButton extends React.Component {
  static propTypes = {
    enabled: PropTypes.bool,
    updateStatus: PropTypes.object,
    updateChannel: PropTypes.string,
  };

  static handleAlertDismiss() {
    updateWebui({ status: false });
  }

  static reloadPage() {
    history.go({ pathname: '/' });
  }

  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    const { updateChannel } = this.props;
    updateWebuiAsync(false, updateChannel);
  }

  render() {
    const { enabled } = this.props;
    const { isFetching } = this.props.updateStatus;
    const { status, error } = this.props.updateStatus.items;

    const successAlert = (
      <Alert bsStyle="success" onDismiss={UpdateButton.reloadPage}>
        <h4>Update Successful!</h4>
        <p>Close this notification to reload.</p>
      </Alert>);
    const errorAlert = (
      <Alert bsStyle="danger" onDismiss={UpdateButton.handleAlertDismiss}>
        <h4>Oops! Something went wrong!</h4>
        <p>Submit an <a href="https://github.com/japanesemediamanager/ShokoServer-WebUI/issues" target="new">Issue on GitHub</a> so we can fix it</p>
        <p>{error.message}</p>
      </Alert>);
    const alert = error instanceof Error ? errorAlert : successAlert;

    return (
      <li className="notification">
        <button
          onClick={this.handleClick}
          type="button"
          className={cx('btn btn-info btn-sm', enabled ? '' : 'hidden')}
        >
          <i className={cx('fa fa-refresh', isFetching ? 'fa-spin' : '')} />
          {isFetching ? 'Downloading...' : 'Update Available!'}
        </button>
        <Modal show={status} backdrop={false}>{alert}</Modal>
      </li>
    );
  }
}

export default UpdateButton;
