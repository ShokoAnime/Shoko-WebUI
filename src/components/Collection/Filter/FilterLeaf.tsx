import DefaultCriteria from '@/components/Collection/Filter/DefaultCriteria';
import MultiValueCriteria from '@/components/Collection/Filter/MultiValueCriteria';
import TagCriteria from '@/components/Collection/Filter/TagCriteria';
import { removeNode, setNegate } from '@/core/slices/collection';
import { useDispatch } from '@/core/store';

import type { FilterExpression, LeafNode } from '@/core/types/api/filter';

type Props = {
  catalogEntry: FilterExpression;
  node: LeafNode;
};

// Boolean leaves absorb Not into their True/False value, and tag leaves track exclusion
// per tag - neither needs its own NOT toggle. Only multi/multiPair leaves can carry a
// meaningful top-level negate (e.g. "year is NOT 2020 or 2021"), so only they get one.
const FilterLeaf = ({ catalogEntry, node }: Props) => {
  const dispatch = useDispatch();
  const onRemove = () => dispatch(removeNode(node.id));
  const onToggleNegate = () => dispatch(setNegate({ nodeId: node.id, negate: !node.negate }));

  if (node.value.kind === 'tag') {
    return <TagCriteria catalogEntry={catalogEntry} node={node} onRemove={onRemove} />;
  }
  if (node.value.kind === 'boolean') {
    return <DefaultCriteria catalogEntry={catalogEntry} node={node} onRemove={onRemove} />;
  }
  return (
    <MultiValueCriteria catalogEntry={catalogEntry} node={node} onRemove={onRemove} onToggleNegate={onToggleNegate} />
  );
};

export default FilterLeaf;
