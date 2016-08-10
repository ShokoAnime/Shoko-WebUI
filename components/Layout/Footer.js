import React from 'react';
const VERSION = __VERSION__;

class Footer extends React.Component {
  render() {
    return (
      <footer className="footer navbar-fixed-bottom">
        <div className="text-center">
          JMM Server Web UI {VERSION}
          <a href="#" className="go-top">
            <i className="fa fa-angle-up"/>
          </a>
        </div>
      </footer>
    );
  }
}

export default Footer