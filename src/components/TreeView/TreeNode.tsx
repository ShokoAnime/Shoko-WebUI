import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { forEach } from 'lodash';
import { mdiCheckboxMarked, mdiChevronUp, mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

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
      dispatch({ type: Events.FOLDER_BROWSE, payload: { id: nodeId, path: Path } });
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
  
  const chopPath = (path) => {
    const splitPath = path.split('\\');
    let part = splitPath.pop();
    if (part === '') { 
      part = splitPath.pop();
    }
    return part;
  };

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
      <div className="flex justify-between">
        <div className="flex space-x-1">
          <div className="inline-block" onClick={toggleExpanded}>
            <Icon
              path={fetching ? mdiLoading : mdiChevronUp}
              spin={fetching}
              size={1}
              rotate={expanded ? 180 : 0}
            />
          </div>
          <span className="select-none">{chopPath(Path)}</span>
        </div>
        <Icon className={cx('inline-block justify-self-end mr-3 text-highlight-1', { 'hidden': level === 1 || nodeId !== selectedNode.id })} path={mdiCheckboxMarked} size={1} />
      </div>
      <ul>{children}</ul>
    </li>
  );
}

export default TreeNode;
