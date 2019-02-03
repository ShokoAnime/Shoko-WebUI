// @flow
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React from 'react';
import {
  Container, Content, Footer as BulmaFooter, Icon,
} from 'react-bulma-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleUp } from '@fortawesome/free-solid-svg-icons';
import { uiVersion } from '../../core/util';

const UI_VERSION = uiVersion();

type Props = {
  version: string,
}

class Footer extends React.Component<Props> {
  static propTypes = {
    version: PropTypes.string,
  };

  render() {
    const { version } = this.props;
    return (
      <BulmaFooter>
        <Container textAlignment="centered">
          <Content>
            Shoko Server {version} Web UI {UI_VERSION}
            <Icon>
              <FontAwesomeIcon icon={faAngleUp} />
            </Icon>
          </Content>
        </Container>
      </BulmaFooter>
    );
  }
}

function mapStateToProps(state): Props {
  const { jmmVersion } = state;

  return {
    version: jmmVersion.version,
  };
}

export default connect(mapStateToProps, () => ({}))(Footer);
