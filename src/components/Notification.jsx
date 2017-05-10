import React, { PropTypes } from 'react';
import cx from 'classnames';
import s from './Notification.css';

class Notification extends React.Component {
  static propTypes = {
    type: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
  };

  render() {
    const { text, type } = this.props;
    return (
      <div className={cx(s.notify, s[type], s['notify-top-right'])} style={{ top: '20px' }}>
        <a className={s['notify-close-btn']} />
        <div className={s['notify-icon']}>
          <div className={s['notify-icon-inner']} style={{ marginTop: '-9px' }}>
            <i className="fa fa-exclamation-triangle" style={{ fontSize: '25px' }} />
          </div>
        </div>
        <div className={s['notify-text']}>
          <h3>{type === 'error' ? 'Error' : 'Success'}</h3>
          <p>{text}</p>
        </div>
      </div>
    );
  }
}

export default Notification;
