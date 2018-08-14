// @flow
import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import s from '../../components/Panels/styles.css';

export type RecentFileType = {
  id: number,
  filename: string,
  recognized: boolean,
}

type Props = RecentFileType & {
  index: number,
}

class RecentFilesItem extends React.Component<Props> {
  static propTypes = {
    id: PropTypes.number,
    index: PropTypes.number,
    filename: PropTypes.string,
    recognized: PropTypes.bool,
  };

  render() {
    const {
      id, index, filename, recognized,
    } = this.props;

    return (
      <tr key={id}>
        <td>
          {index}
        </td>
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
