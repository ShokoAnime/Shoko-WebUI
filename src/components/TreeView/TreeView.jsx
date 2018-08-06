// @flow
import PropTypes from 'prop-types';
import React from 'react';
import s from './TreeView.css';
import TreeNode from './TreeNode';

type Props = {
  onSelect: (any) => any
}

type State = {
  selectedNode: any,
}

class TreeView extends React.Component<Props, State> {
  static propTypes = {
    onSelect: PropTypes.func,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      selectedNode: null,
    };
  }

  handleNodeSelect = (node: any) => {
    const { onSelect } = this.props;
    this.setState({ selectedNode: node });
    if (typeof onSelect === 'function') {
      // FIXME: need some cross-platform way of choosing a directory separator
      onSelect(`${node.props.basePath}`);
    }
  };

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
