import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import { forEach } from 'lodash';
import Header from './Header';
import Sidebar from '../Sidebar/Sidebar';
import Footer from './Footer';
import s from './Layout.css';
import Notification from '../Notification';

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
      alerts.push(<Notification type={alert.type} text={alert.text} />);
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
