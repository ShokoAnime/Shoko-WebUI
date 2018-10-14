// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { forEach } from 'lodash';
import cx from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCaretRight, faCaretDown,
} from '@fortawesome/free-solid-svg-icons';
import connect from 'react-redux/es/connect/connect';
import Events from '../../core/events';
import { setSelectedItems } from '../../core/actions/modals/BrowseFolder';

export type SelectedNodeType = {
  path: string,
  id: number,
}

type ApiNodeType = {
  nodeId: number,
  full_path: string,
  dir: string,
}

type NodeType = {
  nodeId: number,
  basePath: string,
  text: string,
  level: number,
}

type State = {
  fetching: boolean,
  expanded: boolean,
  loaded: boolean,
}

type Props = {
  selectedNode: SelectedNodeType,
  level: number,
  basePath: string,
  fetch: (number, string) => void,
  select: (SelectedNodeType) => void,
  text: string,
  nodeId: number,
  items: Array<NodeType>,
}

class TreeNode extends React.Component<Props, State> {
  static propTypes = {
    basePath: PropTypes.string,
    text: PropTypes.string,
    level: PropTypes.number,
    selectedNode: PropTypes.number,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      fetching: false,
      expanded: false,
      loaded: false,
    };
  }

  toggleExpanded = (event: Event) => {
    const { expanded, loaded } = this.state;
    const { basePath, fetch, nodeId } = this.props;

    if (!loaded) {
      fetch(nodeId, basePath);
      this.setState({ expanded: true, loaded: true });
    } else {
      this.setState({ expanded: !expanded });
    }
    event.stopPropagation();
  };

  toggleSelected = (event: Event) => {
    const { select, nodeId, basePath } = this.props;
    select({ id: nodeId, path: basePath });
    event.stopPropagation();
  };

  render() {
    const {
      text, level, selectedNode, items, nodeId,
    } = this.props;
    const { fetching, expanded } = this.state;
    const selected = nodeId === selectedNode.id;

    const children = [];
    if (expanded) {
      forEach(items, (node: ApiNodeType) => {
        children.push(<ConnectedTreeNode
          key={node.nodeId}
          nodeId={node.nodeId}
          basePath={node.full_path}
          text={node.dir}
          level={level + 1}
        />);
      });
    }
    return (
      <li
        className={cx(
          'list-group-item',
          level === 1 ? 'root' : null, selected ? 'selected' : null,
        )}
        onClick={this.toggleSelected}
      >
        <FontAwesomeIcon
          onClick={this.toggleExpanded}
          spin={fetching}
          icon={expanded ? faCaretDown : faCaretRight}
        />
        <span>{text}</span>
        <ul>{children}</ul>
      </li>
    );
  }
}

function mapStateToProps(state, props) {
  const { modals, fetching } = state;
  const { browseFolder } = modals;
  const { items, nodeId, selectedNode } = browseFolder;

  return {
    items: items[props.nodeId] || [],
    fetching: fetching[`browse-treenode-${nodeId}`] === true,
    selectedNode,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    fetch: (id, path) => dispatch({ type: Events.OS_BROWSE, payload: { id, path } }),
    select: value => dispatch(setSelectedItems(value)),
  };
}

const ConnectedTreeNode = connect(mapStateToProps, mapDispatchToProps)(TreeNode);
export default ConnectedTreeNode;
