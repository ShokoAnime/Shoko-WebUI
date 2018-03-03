// @flow
import PropTypes from 'prop-types';
import React from 'react';
import s from '../../components/Panels/styles.css';

type Props = {
  state: string,
}

class CommandsItemStatus extends React.Component<Props> {
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
