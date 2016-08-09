import React, {PropTypes} from 'react';
import {connect} from 'react-redux'
import cx from 'classnames';
import { fetchQueues } from '../../core/actions';
import store from '../../core/store';
import TimeUpdated from './TimeUpdated';
import s from './styles.css';

class Commands extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    isFetching: PropTypes.bool,
    lastUpdated: PropTypes.number,
    autoUpdate: PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.handleRefresh = this.handleRefresh.bind(this);
  }

  handleRefresh() {
    const state = store.getState();
    store.dispatch(fetchQueues(state.activeApiKey));
  }

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
      commands.push(<tr key={"details-"+key}><td colSpan="3"><div className={s['text-wrapper']}>{item.state}</div></td></tr>);
    } //<button onClick={this.handleRefresh} type="button" className="btn btn-primary pull-right">Run import</button>
    return (
      <div className={this.props.className}>
        <section className="panel">
          <header className="panel-heading">Commands
            <div className="pull-right"><TimeUpdated className={s['timer']} timestamp={lastUpdated}/></div>
          </header>
          <div className={s['fixed-panel']}>
          <table className="table">
            <tbody>
            {commands}
            </tbody>
          </table>
            </div>
        </section>
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
