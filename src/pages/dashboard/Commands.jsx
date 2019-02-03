// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { forEach } from 'lodash';
import { Table } from 'react-bulma-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTasks, faListAlt, faImage } from '@fortawesome/free-solid-svg-icons';
import FixedPanel from '../../components/Panels/FixedPanel';

const icons = { hash: faTasks, general: faListAlt, image: faImage };
const names = { hash: 'Hasher', general: 'General', image: 'Images' };

type Props = {
  items: {
    count: number,
    state: string,
  }
}

class Commands extends React.Component<Props> {
  static propTypes = {
    items: PropTypes.object,
  };

  renderCount = (key, count) => (
    <tr key={`count-${key}`}>
      <td className="icon-column">
        <FontAwesomeIcon icon={icons[key]} />
      </td>
      <td>{names[key]}</td>
      <td>{count}</td>
    </tr>
  );

  renderStatus = (key, status) => (
    <tr key={`status-${key}`}>
      <td />
      <td colSpan="2">{status}</td>
    </tr>
  );

  render() {
    const { items } = this.props;
    const commands = [];
    forEach(items, (item, key) => {
      commands.push(this.renderCount(key, item.count));
      commands.push(this.renderStatus(key, item.state));
    });

    return (
      <FixedPanel
        className="commands"
        title="Commands"
        description="Commands currently being processed"
      >
        <Table>
          <tbody>
            {commands}
          </tbody>
        </Table>
      </FixedPanel>
    );
  }
}

function mapStateToProps(state) {
  const { queueStatus } = state;

  return {
    items: queueStatus,
  };
}

export default connect(mapStateToProps, () => ({}))(Commands);
