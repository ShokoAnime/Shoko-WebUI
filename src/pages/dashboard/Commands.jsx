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
  className: string,
  items: {
    count: number,
    state: string,
  }
}

class Commands extends React.Component<Props> {
  static propTypes = {
    className: PropTypes.string,
    items: PropTypes.object,
  };

  renderCount = (name, count) => (
    <tr>
      <td className="icon-column">
        <FontAwesomeIcon icon={icons[name]} />
      </td>
      <td>{names[name]}</td>
      <td>{count}</td>
    </tr>
  );

  renderStatus = status => (
    <tr>
      <td />
      <td colSpan="2">{status}</td>
    </tr>
  );

  render() {
    const { items, className } = this.props;
    const commands = [];
    forEach(items, (item, key) => {
      commands.push(this.renderCount(key, item.count));
      commands.push(this.renderStatus(item.state));
    });

    return (
      <div className={className}>
        <FixedPanel
          title="Commands"
          description="Commands currently being processed"
        >
          <Table>
            <tbody>
              {commands}
            </tbody>
          </Table>
        </FixedPanel>
      </div>
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
