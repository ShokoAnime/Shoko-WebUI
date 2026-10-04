import { useState } from 'react';
import { mdiClose, mdiEyeOffOutline, mdiEyeOutline, mdiUndo } from '@mdi/js';
import { useToggle } from 'usehooks-ts';

import Input from '@/components/Input/Input';

import type { EndIcon } from '@/components/Input/Input';

type Props = {
  id: string;
  label: string;
  value: unknown;
  onChange: (value: string) => void;
};

/**
 * How the server sends a stored secret: `***SECRET-UNCHANGED***`, or with a fingerprint folded in. Sent back as it
 * came, it keeps the stored secret.
 */
const MASKED_PATTERN = /^\*\*\*SECRET-UNCHANGED(?::[^*]*)?\*\*\*$/;

const isMaskedSecret = (value: unknown): value is string => typeof value === 'string' && MASKED_PATTERN.test(value);

/**
 * A secret. A stored one is never shown: the input stays empty until the user types a new one. Left alone, the masked
 * value goes back as it came, so the server keeps the secret; cleared, an empty string goes back, which clears it.
 */
const PasswordField = ({ id, label, onChange, value }: Props) => {
  const isUnchanged = isMaskedSecret(value);

  // The masked value of the stored secret, to send back when the user undoes their change.
  const [storedMask, setStoredMask] = useState(isUnchanged ? value : null);
  if (isUnchanged && value !== storedMask) setStoredMask(value);

  const [showPassword, toggleShowPassword] = useToggle(false);

  const typedValue = isUnchanged || typeof value !== 'string' ? '' : value;
  const hasTyped = typedValue !== '';

  let placeholder = '';
  if (isUnchanged) placeholder = 'Unchanged (hidden)';
  else if (storedMask && !hasTyped) placeholder = 'Cleared when saved';

  const endIcons: EndIcon[] = [];
  if (hasTyped) {
    endIcons.push({
      icon: showPassword ? mdiEyeOffOutline : mdiEyeOutline,
      onClick: toggleShowPassword,
      tooltip: showPassword ? 'Hide' : 'Show',
    });
  }
  if (isUnchanged) {
    endIcons.push({ icon: mdiClose, onClick: () => onChange(''), tooltip: 'Clear the stored value' });
  } else if (storedMask) {
    endIcons.push({ icon: mdiUndo, onClick: () => onChange(storedMask), tooltip: 'Keep the stored value' });
  }

  return (
    <Input
      id={id}
      label={label}
      type={showPassword && hasTyped ? 'text' : 'password'}
      value={typedValue}
      placeholder={placeholder}
      onChange={event => onChange(event.target.value)}
      endIcons={endIcons}
    />
  );
};

export default PasswordField;
