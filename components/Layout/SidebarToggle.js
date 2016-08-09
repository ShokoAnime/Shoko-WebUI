import React, { PropTypes } from 'react';
import store from '../../core/store';
import { toggleSidebar } from '../../core/actions';
import s from './Layout.css';

class SidebarToggle extends React.Component {
  static propTypes = {
    enabled: PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    let newState = !this.props.enabled;
    store.dispatch(toggleSidebar(newState));
  }

  render() {
    const {enabled} = this.props;
    return (
    <div className={s["sidebar-toggle"]} onClick={this.handleClick}>
      <i className="fa fa-bars"/>
    </div>
    );
  }
}

export default SidebarToggle;
