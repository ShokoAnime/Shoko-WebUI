// @flow
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React from 'react';
import { Container, Content } from 'react-bulma-components';
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
      <footer>
        <Container textAlignment="centered">
          <Content>
            Shoko Server {version} Web UI {UI_VERSION}
            <a className="go-top">
              <i className="fa fa-angle-up" />
            </a>
          </Content>
        </Container>
      </footer>
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
