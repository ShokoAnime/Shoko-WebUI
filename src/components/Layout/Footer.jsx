// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { uiVersion } from '../../core/util';
import { connect } from 'react-redux';

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
      <footer className="footer">
        <div className="text-center">
          Shoko Server {version} Web UI {UI_VERSION}
          <a className="go-top">
            <i className="fa fa-angle-up" />
          </a>
        </div>
      </footer>
    );
  }
}

function mapStateToProps(state):Props {
  const { jmmVersion } = state;

  return {
    version: jmmVersion.version,
  };
}

export default connect(mapStateToProps, () => {})(Footer);
