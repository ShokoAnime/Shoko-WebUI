// @flow
import React from 'react';
import Link from '../Link/Link';

class Logo extends React.Component {
  render() {
    return (
      <Link to="/dashboard" className="logo">Shoko<span>Server</span></Link>
    );
  }
}

export default Logo;
