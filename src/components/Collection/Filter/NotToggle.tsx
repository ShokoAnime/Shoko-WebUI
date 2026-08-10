import Button from '@/components/Input/Button';

type Props = {
  negate: boolean;
  onToggle: () => void;
};

// Shared between leaf (Criteria.tsx) and group (FilterGroup.tsx) headers - a real Button
// so it reads as an actual pressable toggle instead of a plain bordered label. Active
// state uses "primary" (blue) rather than "danger" (red) - red reads as an error/disabled
// cue rather than "this toggle is on".
const NotToggle = ({ negate, onToggle }: Props) => (
  <Button
    buttonType={negate ? 'primary' : 'secondary'}
    buttonSize="small"
    onClick={onToggle}
    tooltip="Toggle NOT"
  >
    NOT
  </Button>
);

export default NotToggle;
