import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { forEach } from 'lodash';
import cx from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCaretRight, faCaretDown, faCircleNotch,
} from '@fortawesome/free-solid-svg-icons';
import Events from '../../core/events';
import { setSelectedNode } from '../../core/slices/modals/browseFolder';
import { RootState } from '../../core/store';

type ApiNodeType = {
  nodeId: number,
  Path: string,
};

type Props = {
  level: number,
  Path: string,
  nodeId: number,
};

function TreeNode(props: Props) {
  const dispatch = useDispatch();

  const fetching = useSelector((state: RootState) => state.fetching[`browse-treenode-${state.modals.browseFolder.id}`]);
  const items = useSelector((state: RootState) => state.modals.browseFolder.items[props.nodeId]);
  const selectedNode = useSelector((state: RootState) => state.modals.browseFolder.selectedNode);

  const [expanded, setExpanded] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const toggleExpanded = (event: React.MouseEvent) => {
    const { nodeId } = props;
    let { Path } = props;

    if (Path === 'Shoko Server') Path = '';

    if (!loaded) {
      dispatch({ type: Events.FOLDER_BROWSE, payload: { nodeId, Path } });
      setExpanded(true);
      setLoaded(true);
    } else {
      setExpanded(!expanded);
    }
    event.stopPropagation();
  };

  const toggleSelected = (event: React.MouseEvent) => {
    const { nodeId, Path } = props;
    dispatch(setSelectedNode({ id: nodeId, Path }));
    event.stopPropagation();
  };

  const children: Array<React.ReactNode> = [];
  if (expanded) {
    forEach(items, (node: ApiNodeType) => {
      children.push(<TreeNode
        key={node.nodeId}
        nodeId={node.nodeId}
        Path={node.Path}
        level={props.level + 1}
      />);
    });
  }

  const { level, Path, nodeId } = props;
  return (
    <li
      className={cx(
        'list-group-item',
        level === 1 ? 'root' : null, (nodeId === selectedNode.id) ? 'selected' : null,
      )}
      onClick={toggleSelected}
      onDoubleClick={toggleExpanded}
    >
      <FontAwesomeIcon
        onClick={toggleExpanded}
        spin={fetching}
        // eslint-disable-next-line no-nested-ternary
        icon={fetching ? faCircleNotch : (expanded ? faCaretDown : faCaretRight)}
      />
      <span className="select-none">{Path}</span>
      <ul>{children}</ul>
    </li>
  );
}

export default TreeNode;
