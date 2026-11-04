import Button from '@/components/Input/Button';

type Props = {
  canSave: boolean;
  isSaving: boolean;
  onCancel: () => void;
  onSave: () => void;
};

const SettingsActionBar = ({ canSave, isSaving, onCancel, onSave }: Props) => (
  <div className="flex justify-end gap-x-3 font-semibold">
    <Button onClick={onCancel} buttonType="secondary" buttonSize="normal">
      Cancel
    </Button>
    <Button onClick={onSave} buttonType="primary" buttonSize="normal" loading={isSaving} disabled={!canSave}>
      Save
    </Button>
  </div>
);

export default SettingsActionBar;
