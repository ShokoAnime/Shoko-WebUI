import React, { PropTypes } from 'react';
import cx from 'classnames';
import s from '../../components/Panels/styles.css';

class RecentFilesItem extends React.Component {
  static propTypes = {
    id: PropTypes.number,
    index: PropTypes.number,
    filename: PropTypes.string,
    recognized: PropTypes.bool,
  };

  render() {
    const { id, index, filename, recognized } = this.props;

    return (
      <tr key={id}>
        <td>{index}</td>
        <td>
          <div className={s['text-wrapper']}>{filename}</div>
        </td>
        <td className="text-right">
          <span className={cx('badge', recognized ? 'bg-success' : 'bg-error')}>
            {recognized ? 'Imported' : 'Unrecognized'}
          </span>
        </td>
        <td />
      </tr>
    );
  }
}

export default RecentFilesItem;
