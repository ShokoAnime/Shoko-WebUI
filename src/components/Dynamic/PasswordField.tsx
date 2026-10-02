import { useState } from 'react';
import { mdiClose, mdiEyeOffOutline, mdiEyeOutline, mdiUndo } from '@mdi/js';

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
const maskedPattern = /^\*\*\*SECRET-UNCHANGED(?::[^*]*)?\*\*\*$/;

const isMaskedSecret = (value: unknown): value is string => typeof value === 'string' && maskedPattern.test(value);

/**
 * A secret. A stored one is never shown: the input stays empty until the user types a new one. Left alone, the masked
 * value goes back as it came, so the server keeps the secret; cleared, an empty string goes back, which clears it.
 */
const PasswordField = ({ id, label, onChange, value }: Props) => {
  // The masked value of the stored secret, to send back when the user undoes their change.
  const [storedValue, setStoredValue] = useState(isMaskedSecret(value) ? value : null);
  if (isMaskedSecret(value) && value !== storedValue) setStoredValue(value);

  const [showTyped, setShowTyped] = useState(false);

  const isUnchanged = isMaskedSecret(value);
  const typed = isUnchanged || typeof value !== 'string' ? '' : value;

  const getPlaceholder = () => {
    if (isUnchanged) return 'Unchanged (hidden)';
    if (storedValue && typed === '') return 'Cleared when saved';
    return '';
  };

  const endIcons: EndIcon[] = [];
  if (typed !== '') {
    endIcons.push({
      icon: showTyped ? mdiEyeOffOutline : mdiEyeOutline,
      onClick: () => setShowTyped(!showTyped),
      tooltip: showTyped ? 'Hide' : 'Show',
    });
  }
  if (isUnchanged) {
    endIcons.push({ icon: mdiClose, onClick: () => onChange(''), tooltip: 'Clear the stored value' });
  } else if (storedValue) {
    endIcons.push({ icon: mdiUndo, onClick: () => onChange(storedValue), tooltip: 'Keep the stored value' });
  }

  return (
    <Input
      id={id}
      label={label}
      type={showTyped && typed !== '' ? 'text' : 'password'}
      value={typed}
      placeholder={getPlaceholder()}
      onChange={event => onChange(event.target.value)}
      endIcons={endIcons}
    />
  );
};

export default PasswordField;
