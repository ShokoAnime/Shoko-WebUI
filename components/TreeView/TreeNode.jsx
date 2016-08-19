import 'isomorphic-fetch';
import React, { PropTypes } from 'react';
import { forEach } from 'lodash';
import cx from 'classnames';
import s from './TreeView.css';
import store from '../../core/store';

function fetchApiFolder(path = '') {
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
    method: 'POST',
    headers,
    body: JSON.stringify({ full_path: path }),
  });
}

class TreeNode extends React.Component {
  static propTypes = {
    basePath: PropTypes.string,
    text: PropTypes.string,
    level: PropTypes.number,
    onSelect: PropTypes.func.isRequired,
    selectedNode: PropTypes.object,
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
    const { basePath } = this.props;

    if (!loaded) {
      fetchApiFolder(basePath)
        .then((response) => response.json())
        .then((json) => {
          const nodes = [];
          forEach(json.subdir, (item) => {
            nodes.push({ path: item.full_path, text: item.dir });
          });
          return nodes;
        })
        .then((nodes) => this.setState({ loaded: true, expanded: !expanded, nodes }));
    } else {
      this.setState({ expanded: !expanded });
    }
    event.stopPropagation();
  }

  toggleSelected(event) {
    this.props.onSelect(this);
    event.stopPropagation();
  }

  render() {
    const { text, level, selectedNode } = this.props;
    const { expanded, nodes } = this.state;
    const selected = this === selectedNode;

    const children = [];
    if (expanded) {
      forEach(nodes, (node) => {
        children.push(
          <TreeNode {...this.props} basePath={node.path} text={node.text} level={level + 1} />
        );
      });
    }
    return (
      <li
        className={cx(s['list-group-item'],
          level === 1 ? s.root : null, selected ? s.selected : null)}
        onClick={this.toggleSelected}
      >
        <i
          className={cx('fa', expanded ? 'fa-caret-down' : 'fa-caret-right')}
          onClick={this.toggleExpanded}
        />
        <span>{text}</span>
        <ul>{children}</ul>
      </li>
    );
  }
}

export default TreeNode;
