import PropTypes from 'prop-types';
import React from 'react';
import { uiVersion } from '../../core/util';

const UI_VERSION = uiVersion();

class Footer extends React.Component {
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

export default Footer;
