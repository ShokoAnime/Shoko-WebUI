// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { Notification } from 'react-bulma-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

type Props = {
  isFetching: boolean,
  code: number,
  message: string,
}

class StatusPanel extends React.Component<Props> {
  static propTypes = {
    isFetching: PropTypes.bool,
    code: PropTypes.number,
    message: PropTypes.string,
  };

  static defaultProps = {
    isFetching: false,
    code: 0,
    message: '',
  };

  render() {
    const { isFetching, code, message } = this.props;
    if (code === 0) { return null; }
    const panelMessage = isFetching ? [<FontAwesomeIcon icon={faSpinner} spin />, 'Sending...'] : message;
    return (
      <Notification color={code === 200 ? 'success' : 'danger'}>{panelMessage}</Notification>
    );
  }
}

export default StatusPanel;
