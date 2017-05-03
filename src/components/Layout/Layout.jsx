import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import { forEach } from 'lodash';
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
    globalAlert: PropTypes.array,
  };

  render() {
    const { sidebarToggle, version, children, globalAlert } = this.props;
    const alerts = [];

    forEach(globalAlert, (alert) => {
      alerts.push(<Alert className={s.alert}>{alert}</Alert>);
    });

    return (
      <section className={cx(s.container, sidebarToggle ? null : s['hide-sidebar'])}>
        <Header />
        <Sidebar />
        <div className={s.alertContainer}>{alerts}</div>
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
