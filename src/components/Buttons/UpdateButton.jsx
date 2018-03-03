// @flow
import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { connect } from 'react-redux';
import { Alert, Modal } from 'react-bootstrap';
import history from '../../core/history';
import { updateWebui } from '../../core/actions';
import Events from '../../core/events';

type Props = {
  enabled: boolean,
  isFetching: boolean,
  downloadWebui: () => void,
  dismissAlert: () => void,
  updateStatus: {
    error ?: string,
    status ?: boolean
  }
}

class UpdateButton extends React.Component<Props> {
  static propTypes = {
    enabled: PropTypes.bool,
    isFetching: PropTypes.bool,
    downloadWebui: PropTypes.func.isRequired,
    dismissAlert: PropTypes.func.isRequired,
    updateStatus: PropTypes.object.isRequired,
  };

  static defaultProps = {
    enabled: false,
  };

  static reloadPage() {
    history.push('/');
  }

  render() {
    const {
      enabled, isFetching, dismissAlert, downloadWebui,
    } = this.props;
    const { status, error } = this.props.updateStatus;

    const successAlert = (
      <Alert bsStyle="success" onDismiss={UpdateButton.reloadPage}>
        <h4>Update Successful!</h4>
        <p>Close this notification to reload.</p>
      </Alert>);
    const errorAlert = (
      <Alert bsStyle="danger" onDismiss={dismissAlert}>
        <h4>Oops! Something went wrong!</h4>
        <p>Submit an <a href="https://github.com/ShokoAnime/ShokoServer-WebUI/issues" target="new">Issue on GitHub</a> so we can fix it</p>
        <p>{error}</p>
      </Alert>);
    const alert = status === true ? successAlert : errorAlert;

    return (
      <li className="notification">
        <button
          onClick={downloadWebui}
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

function mapStateToProps(state) {
  const { updateAvailable, webuiVersionUpdate, fetching } = state;

  return {
    enabled: updateAvailable.status,
    isFetching: fetching.downloadUpdates === true,
    updateStatus: webuiVersionUpdate,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    downloadWebui: () => dispatch({ type: Events.WEBUI_UPDATE }),
    dismissAlert: () => dispatch(updateWebui({ status: false })),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UpdateButton);
