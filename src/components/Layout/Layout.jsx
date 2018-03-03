// @flow
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import Header from './Header';
import Sidebar from '../Sidebar/Sidebar';
import Footer from './Footer';
import s from './Layout.css';
import AlertContainer from '../AlertContainer';

type Props = {
  sidebarToggle: boolean,
  children?: any
}

class Layout extends Component<Props> {
  static propTypes = {
    sidebarToggle: PropTypes.bool,
    children: PropTypes.any,
  };

  render() {
    const { sidebarToggle, children } = this.props;

    return (
      <section className={cx(s.container, sidebarToggle ? null : s['hide-sidebar'])}>
        <Header />
        <Sidebar />
        <AlertContainer />
        {children}
        <Footer />
      </section>
    );
  }
}

function mapStateToProps(state): Props {
  const { sidebarToggle } = state;

  return {
    sidebarToggle,
  };
}

export default connect(mapStateToProps, () => {})(Layout);
