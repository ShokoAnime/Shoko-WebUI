import React, { PropTypes } from 'react';
import {connect} from 'react-redux';
import history from '../../core/history';
import cx from 'classnames';
import Header from './Header';
import Sidebar from '../Sidebar';
import s from './Layout.css';

class Layout extends React.Component {

  static propTypes = {
    className: PropTypes.string,
    sidebarToggle: PropTypes.bool
  };

  render() {
    const { sidebarToggle } = this.props;
    return (
        <section className={cx(s.container,sidebarToggle?null:s['hide-sidebar'])}>
            <Header />
            <Sidebar />
            {this.props.children}
        </section>
    );
  }
}

function mapStateToProps(state) {
  const { sidebarToggle, webuiVersionUpdate } = state;

  if (webuiVersionUpdate.status === true) {
    history.push({
      pathname: '/',
    });
  }
  return {
    sidebarToggle
  }
}

export default connect(mapStateToProps)(Layout)

