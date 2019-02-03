// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'react-bulma-components';
import Events from '../../core/events';

type Props = {
  enabled: boolean,
  isFetching: boolean,
  downloadWebui: () => void,
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
  };

  static defaultProps = {
    enabled: false,
  };

  render() {
    const {
      enabled, isFetching, downloadWebui,
    } = this.props;

    return (
      <React.Fragment>
        {enabled && (
          <Button
            rounded
            color="info"
            loading={isFetching}
            onClick={downloadWebui}
          >Update available!
          </Button>
        )}
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  const { updateAvailable, fetching } = state;

  return {
    enabled: updateAvailable,
    isFetching: fetching.downloadUpdates === true,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    downloadWebui: () => dispatch({ type: Events.WEBUI_UPDATE }),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UpdateButton);
