import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { forEach } from 'lodash';
import { mdiCheckboxMarked, mdiChevronUp, mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import { setSelectedNode } from '@/core/slices/modals/browseFolder';
import { RootState } from '@/core/store';
import { useLazyGetFolderQuery } from '@/core/rtkQuery/splitV3Api/folderApi';
import toast from '../Toast';

type Props = {
  level: number,
  Path: string,
  nodeId: number,
};

function TreeNode(props: Props) {
  const dispatch = useDispatch();
  
  const [fetchFolders, folders] = useLazyGetFolderQuery();
  const selectedNode = useSelector((state: RootState) => state.modals.browseFolder.selectedNode);

  const [expanded, setExpanded] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const { level, Path, nodeId } = props;
  const isSelected = nodeId === selectedNode.id;

  const toggleExpanded =  (event: React.MouseEvent) => {
    if (!loaded) {
      fetchFolders(Path).catch((reason) => { toast.error(`${reason} - Fetching folder ${Path} failed.`); });
      setExpanded(true);
      setLoaded(true);
    } else {
      setExpanded(!expanded);
    }
    event.stopPropagation();
  };

  const toggleSelected = (event: React.MouseEvent) => {
    dispatch(setSelectedNode({ id: nodeId, Path }));
    event.stopPropagation();
  };

  const children: Array<React.ReactNode> = [];
  if (expanded) {
    forEach(folders.data, (node) => {
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

 
  return (
    <li
      className={cx(
        'list-group-item',
        level === 1 ? 'root' : null, isSelected ? 'selected' : null,
      )}
      onClick={toggleSelected}
      onDoubleClick={toggleExpanded}
    >
      <div className="flex justify-between">
        <div className="flex space-x-1">
          <div className="inline-block" onClick={toggleExpanded}>
            <Icon
              path={folders.isFetching ? mdiLoading : mdiChevronUp}
              spin={folders.isFetching}
              size={1}
              rotate={expanded ? 180 : 0}
            />
          </div>
          <span className="select-none">{chopPath(Path)}</span>
        </div>
        <Icon className={cx('inline-block justify-self-end mr-3 text-highlight-1', { 'hidden': !isSelected })} path={mdiCheckboxMarked} size={1} />
      </div>
      <ul>{children}</ul>
    </li>
  );
}

export default React.memo(TreeNode);
