import React, {PropTypes} from 'react';
import {connect} from 'react-redux'
import cx from 'classnames';
import FixedPanel from '../../components/Panels/FixedPanel';
import s from '../../components/Panels/styles.css';

class Commands extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    isFetching: PropTypes.bool,
    lastUpdated: PropTypes.number,
    autoUpdate: PropTypes.bool
  };

  render() {
    const {items, isFetching, lastUpdated} = this.props;
    let commands = [];
    let icons = {'hash': 'fa-tasks', 'general':'fa-list-alt', 'image':'fa-picture-o'};
    let names = {'hash':'Hasher', 'general':'General', 'image':'Images'};
    for (let key in items) {
      let item = items[key];
      commands.push(<tr key={"main-"+key}>
        <td className={s['icon-column']}><i className={cx("fa", icons[key])}/></td>
        <td>{names[key]}</td>
        <td>{item.count}</td>
      </tr>);
      commands.push(<tr key={"details-"+key}><td/><td colSpan="2"><div className={s['text-wrapper']}>{item.state}</div></td></tr>);
    }
    return (
      <div className={this.props.className}>
        <FixedPanel title="Commands" description="Commands currently being processed" lastUpdated={lastUpdated}>
          <table className="table">
            <tbody>
            {commands}
            </tbody>
          </table>
        </FixedPanel>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { queueStatus } = state;
  const {
    isFetching,
    lastUpdated,
    items: items
  } = queueStatus || {
    isFetching: true,
    items: []
  };

  return {
    items,
    isFetching,
    lastUpdated
  }
}

export default connect(mapStateToProps)(Commands)
