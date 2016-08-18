import 'isomorphic-fetch';
import React, { PropTypes } from 'react';
import cx from 'classnames';
import store from '../../core/store';

function fetchApiFolder (path = '') {
  const state = store.getState();
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    apikey: state.apiSession.apikey,
  };

  if (path === '') {
    // eslint-disable-next-line no-undef
    return fetch('/api/os/drives', { headers });
  }

  // eslint-disable-next-line no-undef
  return fetch('/api/os/folder', {
    headers,
    body: JSON.stringify({ folder: path }),
  });
}

class TreeNode extends React.Component {
  static propTypes = {
    basePath: PropTypes.string,
    text: PropTypes.string,
    level: PropTypes.number,
  };

  constructor(props) {
    super(props);
    this.toggleExpanded = this.toggleExpanded.bind(this);
    this.toggleSelected = this.toggleSelected.bind(this);
    this.state = {
      expanded: false,
      loaded: false,
      selected: false,
      nodes: [],
    };
  }

  toggleExpanded(event) {
    const { expanded, loaded } = this.state;

    if (!loaded) {
      fetchApiFolder()
        .then((response) => response.json())
        .then((json) => this.setState({ loaded: true, expanded: !expanded, nodes: json }));
    } else {
      this.setState({ expanded: !expanded });
    }
    event.stopPropagation();
  }

  toggleSelected(id, event) {
    this.setState({ selected: !this.state.selected });
    event.stopPropagation();
  }

  render() {
    const { text } = this.props;
    const { expanded } = this.state;
    const indents = '';
    const children = [];
    return (
      <li className="list-group-item" onClick={this.toggleSelected}>
        {indents}
        <i
          className={cx('fa', expanded ? 'fa-caret-down' : 'fa-caret-right')}
          onClick={this.toggleExpanded}
        />
        {text}
        {children}
      </li>
    );
  }
}

export default TreeNode;
