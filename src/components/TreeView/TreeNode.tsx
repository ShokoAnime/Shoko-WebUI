import PropTypes from 'prop-types';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { forEach } from 'lodash';
import cx from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCaretRight, faCaretDown,
} from '@fortawesome/free-solid-svg-icons';
import Events from '../../core/events';
import { setSelectedNode } from '../../core/slices/modals/browseFolder';
import { RootState } from '../../core/store';

export type SelectedNodeType = {
  path: string,
  id: number,
};

type ApiNodeType = {
  nodeId: number,
  full_path: string,
  dir: string,
};

type State = {
  fetching: boolean,
  expanded: boolean,
  loaded: boolean,
};

class TreeNode extends React.Component<Props, State> {
  static propTypes = {
    basePath: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    level: PropTypes.number.isRequired,
    nodeId: PropTypes.number.isRequired,
  };

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
    const { basePath, fetch, nodeId } = this.props;

    if (!loaded) {
      fetch(nodeId, basePath);
      this.setState({ expanded: true, loaded: true });
    } else {
      this.setState({ expanded: !expanded });
    }
    event.stopPropagation();
  };

  toggleSelected = (event: React.MouseEvent) => {
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

    const children: Array<any> = [];
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

const mapState = (state: RootState, props: any) => ({
  items: state.modals.browseFolder.items[props.nodeId],
  fetching: state.fetching[`browse-treenode-${state.modals.browseFolder.id}`],
  selectedNode: state.modals.browseFolder.selectedNode as any,
});

const mapDispatch = {
  fetch: (id: number, path: string) => ({ type: Events.OS_BROWSE, payload: { id, path } }),
  select: (value: SelectedNodeType) => (setSelectedNode(value)),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector> & {
  level: number,
  basePath: string,
  text: string,
  nodeId: number,
};

const ConnectedTreeNode = connector(TreeNode);
export default ConnectedTreeNode;
