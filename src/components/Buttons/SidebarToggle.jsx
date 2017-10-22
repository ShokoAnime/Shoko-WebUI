import PropTypes from 'prop-types';
import React from 'react';
import store from '../../core/store';
import { toggleSidebar } from '../../core/actions';
import s from '../Layout/Layout.css';

class SidebarToggle extends React.Component {
  static propTypes = {
    enabled: PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    const newState = !this.props.enabled;
    store.dispatch(toggleSidebar(newState));
  }

  render() {
    return (
      <div className={s['sidebar-toggle']} onClick={this.handleClick}>
        <i className="fa fa-bars" />
      </div>
    );
  }
}

export default SidebarToggle;
