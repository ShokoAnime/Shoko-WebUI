import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { forEach } from 'lodash';
import { mdiCheckboxMarked, mdiChevronUp, mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import { setSelectedNode } from '@/core/slices/modals/browseFolder';
import { RootState } from '@/core/store';
import TreeNode from './TreeNode';
import { useGetFolderDrivesQuery } from '@/core/rtkQuery/splitV3Api/folderApi';

function RootNode(props) {
  const dispatch = useDispatch();
  
  const drives = useGetFolderDrivesQuery();
  
  const selectedNode = useSelector((state: RootState) => state.modals.browseFolder.selectedNode);

  const [expanded, setExpanded] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const { nodeId } = props;
  const isSelected = nodeId === selectedNode.id;

  const toggleExpanded = (event: React.MouseEvent) => {
    
    let { Path } = props;

    if (Path === 'Shoko Server') Path = '';

    if (!loaded) {
      setExpanded(true);
      setLoaded(true);
    } else {
      setExpanded(!expanded);
    }
    event.stopPropagation();
  };

  const toggleSelected = (event: React.MouseEvent) => {
    const { Path } = props;
    dispatch(setSelectedNode({ id: nodeId, Path }));
    event.stopPropagation();
  };

  const children: Array<React.ReactNode> = [];
  if (expanded) {
    forEach(drives.data, (node) => {
      children.push(<TreeNode
        key={node.nodeId}
        nodeId={node.nodeId}
        Path={node.Path}
        level={1}
      />);
    });
  }

  const { level } = props;
  return (
    <li
      className={cx(
        'list-group-item',
        level === 1 ? 'root' : null, (isSelected) ? 'selected' : null,
      )}
      onClick={toggleSelected}
      onDoubleClick={toggleExpanded}
    >
      <div className="flex justify-between">
        <div className="flex space-x-1">
          <div className="inline-block" onClick={toggleExpanded}>
            <Icon
              path={drives.isFetching ? mdiLoading : mdiChevronUp}
              spin={drives.isFetching}
              size={1}
              rotate={expanded ? 180 : 0}
            />
          </div>
          <span className="select-none">Shoko Server</span>
        </div>
        <Icon className={cx('inline-block justify-self-end mr-3 text-highlight-1', { 'hidden': !isSelected })} path={mdiCheckboxMarked} size={1} />
      </div>
      <ul>{children}</ul>
    </li>
  );
}

export default RootNode;
