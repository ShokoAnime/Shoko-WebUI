import React, {PropTypes} from 'react';
import {connect} from 'react-redux'
import cx from 'classnames';
import { fetchQueues } from '../../core/actions';
import store from '../../core/store';
import TimeUpdated from './TimeUpdated';

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
      commands.push(<tr>
        <td><i className={cx("fa", icons[key])}/></td>
        <td>{names[key]}</td>
        <td>{item.count}</td>
      </tr>);
      commands.push(<tr>
        <td/>
        <td>{item.state}</td>
        <td/>
      </tr>);
    }
    return (
      <div className={this.props.className}>
        <section className="panel">
          <header className="panel-heading">
            Commands
            <button onClick={this.handleRefresh} type="button" className="btn btn-primary pull-right">Run import</button>
          </header>
          <table className="table">
            <thead>
            <tr>
              <th colSpan="3"><TimeUpdated timestamp={lastUpdated}/></th>
            </tr>
            </thead>
            <tbody>
            {commands}
            </tbody>
          </table>
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
