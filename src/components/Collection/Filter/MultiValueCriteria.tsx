import Criteria from '@/components/Collection/Filter/Criteria';

import type { FilterExpression, LeafNode } from '@/core/types/api/filter';

type Props = {
  catalogEntry: FilterExpression;
  node: LeafNode;
  onRemove: () => void;
  onToggleNegate: () => void;
};

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const getDisplayValues = (node: LeafNode): string[] => {
  if (node.value.kind === 'multiPair') return node.value.values.map(([first, second]) => `${first}: ${second}`);
  if (node.value.kind === 'multi') return node.value.values;
  return [];
};

const MultiValueCriteria = ({ catalogEntry, node, onRemove, onToggleNegate }: Props) => {
  const displayValues = getDisplayValues(node);

  return (
    <Criteria
      catalogEntry={catalogEntry}
      node={node}
      onRemove={onRemove}
      onToggleNegate={onToggleNegate}
      parameterExists={displayValues.length > 0}
      transformedParameter={displayValues.map(capitalize).join(', ')}
      type="multivalue"
    />
  );
};

export default MultiValueCriteria;
