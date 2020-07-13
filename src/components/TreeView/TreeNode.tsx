import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { forEach } from 'lodash';
import cx from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCaretRight, faCaretDown, faCircleNotch,
} from '@fortawesome/free-solid-svg-icons';
import Events from '../../core/events';
import { setSelectedNode } from '../../core/slices/modals/browseFolder';
import { RootState } from '../../core/store';

export type SelectedNodeType = {
  Path: string,
  id: number,
};

type ApiNodeType = {
  nodeId: number,
  Path: string,
};

type State = {
  fetching: boolean,
  expanded: boolean,
  loaded: boolean,
};

class TreeNode extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      fetching: false,
      expanded: false,
      loaded: false,
    };
  }

  toggleExpanded = (event: React.MouseEvent) => {
    const { expanded, loaded } = this.state;
    const { fetch, nodeId } = this.props;
    let { Path } = this.props;

    if (Path === 'Shoko Server') Path = '';

    if (!loaded) {
      fetch(nodeId, Path);
      this.setState({ expanded: true, loaded: true });
    } else {
      this.setState({ expanded: !expanded });
    }
    event.stopPropagation();
  };

  toggleSelected = (event: React.MouseEvent) => {
    const { select, nodeId, Path } = this.props;
    select({ id: nodeId, Path });
    event.stopPropagation();
  };

  render() {
    const {
      Path, level, selectedNode, items, nodeId,
    } = this.props;
    const { fetching, expanded } = this.state;
    const selected = nodeId === selectedNode.id;

    const children: Array<any> = [];
    if (expanded) {
      forEach(items, (node: ApiNodeType) => {
        children.push(<ConnectedTreeNode
          key={node.nodeId}
          nodeId={node.nodeId}
          Path={node.Path}
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
          // eslint-disable-next-line no-nested-ternary
          icon={fetching ? faCircleNotch : (expanded ? faCaretDown : faCaretRight)}
        />
        <span>{Path}</span>
        <ul>{children}</ul>
      </li>
    );
  }
}

const mapState = (state: RootState, props: any) => ({
  items: state.modals.browseFolder.items[props.nodeId],
  fetching: state.fetching[`browse-treenode-${state.modals.browseFolder.id}`],
  selectedNode: state.modals.browseFolder.selectedNode as SelectedNodeType,
});

const mapDispatch = {
  fetch: (id: number, path: string) => ({ type: Events.OS_BROWSE, payload: { id, path } }),
  select: (value: SelectedNodeType) => (setSelectedNode(value)),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector> & {
  level: number,
  Path: string,
  nodeId: number,
};

const ConnectedTreeNode = connector(TreeNode);
export default ConnectedTreeNode;
