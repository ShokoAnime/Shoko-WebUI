import React, { PropTypes } from 'react';
import Header from './Header';
import Sidebar from '../Sidebar';
import s from './Layout.css';

class Layout extends React.Component {

  static propTypes = {
    className: PropTypes.string,
  };

  render() {
    return (
        <section className={s.container}>
            <Header />
            <Sidebar />
            {this.props.children}
        </section>
    );
  }
}

export default Layout;
