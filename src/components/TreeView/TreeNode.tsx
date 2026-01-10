import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { mdiCheckboxMarkedCircleOutline, mdiChevronUp, mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { forEach } from 'lodash';

import toast from '@/components/Toast';
import { useFolderDrivesQuery, useFolderQuery } from '@/core/react-query/folder/queries';
import { setSelectedNode } from '@/core/slices/modals/browseFolder';

import type { RootState } from '@/core/store';
import type { DriveType, FolderType } from '@/core/types/api/folder';

type Props = {
  level: number;
  nodeId: number;
  path: string;
  isAccessible?: boolean;
};

const TreeNode = React.memo((props: Props) => {
  const dispatch = useDispatch();

  const selectedNode = useSelector((state: RootState) => state.modals.browseFolder.selectedNode);

  const [expanded, setExpanded] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const { isAccessible, level, nodeId, path } = props;
  const isSelected = nodeId === selectedNode.id;

  const drivesQuery = useFolderDrivesQuery(nodeId === 0);
  const foldersQuery = useFolderQuery(path, nodeId !== 0 && expanded);

  useEffect(() => {
    if (foldersQuery.isError) {
      const queryError = foldersQuery.error.toString();
      toast.error(`${queryError} - Fetching folder ${path} failed.`);
    }
  }, [path, foldersQuery.error, foldersQuery.isError]);

  const toggleExpanded = (event: React.MouseEvent) => {
    if (!isAccessible) return;
    if (!loaded) {
      setExpanded(true);
      setLoaded(true);
    } else {
      setExpanded(!expanded);
    }
    event.stopPropagation();
  };

  const toggleSelected = (event: React.MouseEvent) => {
    dispatch(setSelectedNode({ id: nodeId, path }));
    event.stopPropagation();
  };

  const children: React.ReactNode[] = [];
  const data = nodeId === 0 ? drivesQuery.data! : foldersQuery.data!;
  if (expanded) {
    forEach(data, (node: DriveType | FolderType) => {
      if ('IsAccessible' in node && !node.IsAccessible) return;
      children.push(
        <TreeNode
          key={node.nodeId}
          nodeId={node.nodeId}
          path={node.Path}
          level={level + 1}
          isAccessible={'IsAccessible' in node ? node.IsAccessible : undefined}
        />,
      );
    });
  }

  const getChoppedPath = () => {
    const isUnix = path.includes('/');

    if (isUnix && level === 2) return path;

    const splitPath = path.split(/[/\\]/g);
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
              path={(nodeId === 0 && drivesQuery.isFetching) || foldersQuery.isFetching ? mdiLoading : mdiChevronUp}
              spin={(nodeId === 0 && drivesQuery.isFetching) || foldersQuery.isFetching}
              size={1}
              rotate={expanded ? 0 : 180}
              className="transition-transform"
            />
          </div>
          <span className={cx('select-none', selectedNode.path === path && 'text-panel-text-primary')}>
            {getChoppedPath()}
          </span>
        </div>
        <Icon
          className={cx('inline-block justify-self-end mr-3 text-panel-text-primary', { hidden: !isSelected })}
          path={mdiCheckboxMarkedCircleOutline}
          size={1}
        />
      </div>
      <ul>{children}</ul>
    </li>
  );
});

export default TreeNode;
