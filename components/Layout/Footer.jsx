import React, { PropTypes } from 'react';

const UI_VERSION = __VERSION__; // eslint-disable-line no-undef

class Footer extends React.Component {
  static propTypes = {
    version: PropTypes.string,
  };

  render() {
    const { version } = this.props;
    return (
      <footer className="footer">
        <div className="text-center">
          JMM Server {version} Web UI {UI_VERSION}
          <a className="go-top">
            <i className="fa fa-angle-up" />
          </a>
        </div>
      </footer>
    );
  }
}

export default Footer;
