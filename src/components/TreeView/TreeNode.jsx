// @flow
import 'isomorphic-fetch';
import PropTypes from 'prop-types';
import React from 'react';
import { forEach } from 'lodash';
import cx from 'classnames';
import Api from '../../core/api';
import type { ApiResponseType } from '../../core/api';
import s from './TreeView.css';

function fetchApiFolder(path = '') {
  if (path === '') {
    return Api.getOsDrives();
  }
  return Api.postOsFolder({ full_path: path });
}

type NodeType = {
  path: string,
  text: string,
}

type State = {
  fetching: boolean,
  expanded: boolean,
  loaded: boolean,
  nodes: Array<NodeType>,
}

type Props = {
  selectedNode: NodeType,
  level: number,
  basePath: string,
  onSelect: (any) => void,
  text: string,
}

class TreeNode extends React.Component<Props, State> {
  static propTypes = {
    basePath: PropTypes.string,
    text: PropTypes.string,
    level: PropTypes.number,
    onSelect: PropTypes.func.isRequired,
    selectedNode: PropTypes.object,
  };

  constructor(props: Props) {
    super(props);
    this.toggleExpanded = this.toggleExpanded.bind(this);
    this.toggleSelected = this.toggleSelected.bind(this);
    this.state = {
      fetching: false,
      expanded: false,
      loaded: false,
      nodes: [],
    };
  }

  toggleExpanded = (event: Event) => {
    const { expanded, loaded } = this.state;
    const { basePath } = this.props;

    if (!loaded) {
      this.setState({ fetching: true });
      fetchApiFolder(basePath)
        .then((json: ApiResponseType): Array<NodeType> => {
          if (json.error) { return []; }
          const nodes = [];
          // $FlowFixMe
          forEach(json.data.subdir, (item) => {
            nodes.push({ path: item.full_path, text: item.dir });
          });
          return nodes;
        })
        .then(nodes => this.setState({ loaded: true, expanded: !expanded, nodes }))
        .finally(() => { this.setState({ fetching: false }); });
    } else {
      this.setState({ expanded: !expanded });
    }
    event.stopPropagation();
  };

  toggleSelected = (event: Event) => {
    const { onSelect } = this.props;
    onSelect(this);
    const { expanded, loaded } = this.state;
    if (expanded === false && loaded === false) {
      this.toggleExpanded(event);
      return;
    }
    event.stopPropagation();
  };

  render() {
    const { text, level, selectedNode } = this.props;
    const { fetching, expanded, nodes } = this.state;
    const selected = this === selectedNode;

    const children = [];
    if (expanded) {
      forEach(nodes, (node) => {
        children.push(<TreeNode
          {...this.props}
          basePath={node.path}
          text={node.text}
          level={level + 1}
        />);
      });
    }
    return (
      <li
        className={cx(
          s['list-group-item'],
          level === 1 ? s.root : null, selected ? s.selected : null,
        )}
        onClick={this.toggleSelected}
      >
        {fetching ? <i className="fa fa-refresh fa-spin" /> : (
          <i
            className={cx(s.caret, 'fa', expanded ? 'fa-caret-down' : 'fa-caret-right')}
            onClick={this.toggleExpanded}
          />
        )}
        <span>{text}</span>
        <ul>{children}</ul>
      </li>
    );
  }
}

export default TreeNode;
