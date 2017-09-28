import PropTypes from 'prop-types';
import React from 'react';
import s from '../../components/Panels/styles.css';

class CommandsItemStatus extends React.Component {
  static propTypes = {
    state: PropTypes.string,
  };

  render() {
    const { state } = this.props;

    return (
      <tr>
        <td />
        <td colSpan="2">
          <div className={s['text-wrapper']}>{state}</div>
        </td>
      </tr>
    );
  }
}

export default CommandsItemStatus;
