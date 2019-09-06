// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Navbar } from 'react-bulma-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faColumns, faImage, faServer } from '@fortawesome/free-solid-svg-icons';


type Props = {
  hasher: number,
  general: number,
  images: number,
}

class QueueStatus extends React.Component<Props> {
  static propTypes = {
    hasher: PropTypes.number,
    general: PropTypes.number,
    images: PropTypes.number,
  };

  render() {
    const { hasher, general, images } = this.props;
    return (
      <React.Fragment>
        <Navbar.Item><FontAwesomeIcon icon={faColumns} />{hasher > 0 && hasher}</Navbar.Item>
        <Navbar.Item><FontAwesomeIcon icon={faImage} />{general > 0 && general}</Navbar.Item>
        <Navbar.Item><FontAwesomeIcon icon={faServer} />{images > 0 && images}</Navbar.Item>
      </React.Fragment>
    );
  }
}

function mapStateToProps(state): Props {
  const { queueStatus } = state;
  const { general, hasher, images } = queueStatus;

  return {
    hasher: hasher ? hasher.count : 0,
    general: general ? general.count : 0,
    images: images ? images.count : 0,
  };
}

export default connect(mapStateToProps, () => ({}))(QueueStatus);
