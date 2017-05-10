// @flow
import PropTypes from 'prop-types';
import React from 'react';
import s from './TreeView.css';
import TreeNode from './TreeNode';

class TreeView extends React.Component {
  static propTypes = {
    onSelect: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.handleNodeSelect = this.handleNodeSelect.bind(this);
    this.state = {
      selectedNode: null,
    };
  }

  handleNodeSelect(node) {
    this.setState({ selectedNode: node });
    if (typeof this.props.onSelect === 'function') {
      // FIXME: need some cross-platform way of choosing a directory separator
      this.props.onSelect(`${node.props.basePath}`);
    }
  }

  render() {
    const { selectedNode } = this.state;
    return (
      <div className={s.treeview}>
        <ul className={s['list-group']}>
          <TreeNode
            basePath=""
            level={1}
            text="Shoko Server"
            selectedNode={selectedNode}
            onSelect={this.handleNodeSelect}
          />
        </ul>
      </div>
    );
  }
}

export default TreeView;
