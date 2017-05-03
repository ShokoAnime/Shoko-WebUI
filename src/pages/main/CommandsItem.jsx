import React, { PropTypes } from 'react';
import cx from 'classnames';
import s from '../../components/Panels/styles.css';

class CommandsItem extends React.Component {
  static propTypes = {
    name: PropTypes.string,
    count: PropTypes.number,
  };

  render() {
    const { name, count } = this.props;
    const icons = { hash: 'fa-tasks', general: 'fa-list-alt', image: 'fa-picture-o' };
    const names = { hash: 'Hasher', general: 'General', image: 'Images' };

    return (
      <tr>
        <td className={s['icon-column']}><i className={cx('fa', icons[name])} /></td>
        <td>{names[name]}</td>
        <td>{count}</td>
      </tr>
    );
  }
}

export default CommandsItem;
