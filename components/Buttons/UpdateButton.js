import React, { PropTypes } from 'react';
import cx from 'classnames';
import { updateWebuiAsync } from '../../core/actions';

class UpdateButton extends React.Component {
  static propTypes = {
    enabled: PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    updateWebuiAsync();
  }

  render() {
    const {enabled} = this.props;
    return (
      <li className="notification">
        <button onClick={this.handleClick} type="button" className={cx("btn btn-info btn-sm",enabled?'':'hidden')}>
          <i className="fa fa-refresh"/> Update available!
        </button>
      </li>
    );
  }
}

export default UpdateButton;





