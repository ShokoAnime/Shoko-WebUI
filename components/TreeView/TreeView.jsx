import React from 'react';
import s from './TreeView.css';
import TreeNode from './TreeNode';

class TreeView extends React.Component {
  render() {
    return (
      <div className={s.treeview}>
        <ul className={s['list-group']}>
          <TreeNode basePath="" level={1} text="JMM Server" />
        </ul>
      </div>
    );
  }
}

export default TreeView;
