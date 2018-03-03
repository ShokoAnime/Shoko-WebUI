// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { Alert } from 'react-bootstrap';

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
    const panelMessage = isFetching ?
      [<i className="fa fa-refresh fa-spin" />, 'Sending...'] : message;
    return (
      <Alert onDismiss={() => {}} bsStyle={code === 200 ? 'success' : 'danger'}>{panelMessage}</Alert>
    );
  }
}

export default StatusPanel;
