import React, { PropTypes } from 'react';
import s from './UserDropdown.css';

class UserToggle extends React.Component {
  static propTypes = {
    user: PropTypes.string,
    bsRole: PropTypes.oneOf(['toggle']),
  };

  constructor(props, context) {
    super(props, context);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    e.preventDefault();

    this.props.onClick(e);
  }

  render() {
    const { user } = this.props;
    return (
      <li className="dropdown">
        <a href="#" className={s['user-toggle']} onClick={this.handleClick}>
          <span className={s["username"]}>{user}</span>
          <b className="caret"/>
        </a>
      </li>
    );
  }
}

export default UserToggle