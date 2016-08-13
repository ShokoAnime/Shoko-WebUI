import React, { PropTypes } from 'react';
import cx from 'classnames';
import s from '../../components/Panels/styles.css';

class RecentFilesItem extends React.Component {
  static propTypes = {
    id: PropTypes.number,
    index: PropTypes.number,
    path: PropTypes.string,
    success: PropTypes.bool,
  };

  render() {
    const { id, index, path, success } = this.props;

    return (
      <tr key={id}>
        <td>{index}</td>
        <td>
          <div className={s['text-wrapper']}>{path}</div>
        </td>
        <td className="text-right">
          <span className={cx('badge', success ? 'bg-success' : 'bg-error')}>
            {success ? 'Imported' : 'Error'}
          </span>
        </td>
        <td />
      </tr>
    );
  }
}

export default RecentFilesItem;
