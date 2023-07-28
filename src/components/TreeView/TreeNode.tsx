import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { forEach } from 'lodash';
import { mdiCheckboxMarkedCircleOutline, mdiChevronUp, mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import { setSelectedNode } from '@/core/slices/modals/browseFolder';
import { RootState } from '@/core/store';
import { useGetFolderDrivesQuery, useLazyGetFolderQuery } from '@/core/rtkQuery/splitV3Api/folderApi';
import type { DriveType, FolderType } from '@/core/types/api/folder';
import toast from '../Toast';

type Props = {
  level: number,
  Path: string,
  nodeId: number,
};

function TreeNode(props: Props) {
  const dispatch = useDispatch();

  const drives = useGetFolderDrivesQuery(undefined, { skip: props.nodeId !== 0 });
  const [fetchFolders, folders] = useLazyGetFolderQuery();
  const selectedNode = useSelector((state: RootState) => state.modals.browseFolder.selectedNode);

  const [expanded, setExpanded] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const { level, Path, nodeId } = props;
  const isSelected = nodeId === selectedNode.id;

  const toggleExpanded = (event: React.MouseEvent) => {
    if (!loaded) {
      if (nodeId !== 0) fetchFolders(Path).catch((reason) => { toast.error(`${reason} - Fetching folder ${Path} failed.`); });
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
  const data = nodeId === 0 ? drives.data! : folders.data!;
  if (expanded) {
    forEach(data, (node: DriveType | FolderType) => {
      children.push(<TreeNode
        key={node.nodeId}
        nodeId={node.nodeId}
        Path={node.Path}
        level={level + 1}
      />);
    });
  }

  const getChoppedPath = () => {
    const isUnix = Path.indexOf('/') !== -1;

    if (isUnix && level === 2) return Path;

    const splitPath = Path.split(/[/\\]/g);
    let part = splitPath.pop();
    if (part === '') {
      part = splitPath.pop();
    }
    return part;
  };

  useEffect(() => {
    if (nodeId === 0) setExpanded(true);
  }, [nodeId]);

  return (
    <li
      className={cx(['cursor-pointer', nodeId !== 0 && 'ml-3 mt-3'])}
      onDoubleClick={toggleExpanded}
    >
      <div className="flex justify-between" onClick={nodeId === 0 ? toggleExpanded : toggleSelected}>
        <div className="flex gap-x-1">
          <div className="inline-block" onClick={toggleExpanded}>
            <Icon
              path={(nodeId === 0 && drives.isFetching) || folders.isFetching ? mdiLoading : mdiChevronUp}
              spin={(nodeId === 0 && drives.isFetching) || folders.isFetching}
              size={1}
              rotate={expanded ? 0 : 180}
              className="transition-transform"
            />
          </div>
          <span className="select-none">{getChoppedPath()}</span>
        </div>
        <Icon className={cx('inline-block justify-self-end mr-3 text-panel-primary', { hidden: !isSelected })} path={mdiCheckboxMarkedCircleOutline} size={1} />
      </div>
      <ul>{children}</ul>
    </li>
  );
}

export default React.memo(TreeNode);
