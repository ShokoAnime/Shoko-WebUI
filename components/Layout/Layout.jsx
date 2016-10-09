import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import { Alert } from 'react-bootstrap';
import Header from './Header';
import Sidebar from '../Sidebar/Sidebar';
import Footer from './Footer';
import s from './Layout.css';

class Layout extends React.Component {

  static propTypes = {
    sidebarToggle: PropTypes.bool,
    version: PropTypes.string,
    children: PropTypes.any,
    globalAlert: PropTypes.oneOf(PropTypes.bool, PropTypes.string),
  };

  render() {
    const { sidebarToggle, version, children, globalAlert } = this.props;
    const alert = (globalAlert === false ? null : <Alert>{globalAlert}</Alert>);

    return (
      <section className={cx(s.container, sidebarToggle ? null : s['hide-sidebar'])}>
        <Header />
        <Sidebar />
        {alert}
        {children}
        <Footer version={version} />
      </section>
    );
  }
}

function mapStateToProps(state) {
  const { sidebarToggle, jmmVersion, globalAlert } = state;

  return {
    sidebarToggle,
    version: jmmVersion.version,
    globalAlert,
  };
}

export default connect(mapStateToProps)(Layout);
