// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { toggleSidebar } from '../../core/actions';
import s from '../Layout/Layout.css';

type Props = {
  enabled: boolean,
  toggleSidebarFunc: (value: boolean) => void
};

class SidebarToggle extends React.Component<Props> {
  static propTypes = {
    enabled: PropTypes.bool.isRequired,
    toggleSidebarFunc: PropTypes.func.isRequired,
  };

  handleClick = () => {
    const { toggleSidebarFunc, enabled } = this.props;
    toggleSidebarFunc(!enabled);
  };

  render() {
    return (
      <div className={s['sidebar-toggle']} onClick={this.handleClick}>
        <i className="fa fa-bars" />
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { sidebarToggle } = state;
  return {
    enabled: sidebarToggle,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    toggleSidebarFunc: value => dispatch(toggleSidebar(value)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SidebarToggle);
