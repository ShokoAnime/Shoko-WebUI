import { useState } from 'react';
import type { SubmitEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import { useCheckSetupTokenMutation } from '@/core/react-query/init/mutations';
import { setSetupToken } from '@/core/slices/setupToken';
import { useDispatch } from '@/core/store';

// Asks for the setup token the server requires in setup and failure mode, and keeps it once the server takes it.
const SetupTokenForm = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { isPending, mutate: checkSetupToken } = useCheckSetupTokenMutation();

  const [token, setToken] = useState('');
  const [isInvalid, setIsInvalid] = useState(false);

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    if (!token) return;

    checkSetupToken(token, {
      onSuccess: (status) => {
        if (status.RequiresSetupToken) {
          setIsInvalid(true);
          return;
        }
        dispatch(setSetupToken(token));
        queryClient.setQueryData(['init', 'server-status'], status);
        // Anything asked for without the token was refused; ask again with it.
        queryClient.invalidateQueries({ predicate: query => query.queryKey[0] !== 'init' }).catch(console.error);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-y-6">
      <div className="flex flex-col gap-y-4">
        <div className="text-xl font-semibold">Setup Token Required</div>
        <div>
          Enter the setup token set on the server (
          <span className="font-semibold text-panel-text-important">SHOKO_SETUP_TOKEN</span>
          ).
        </div>
      </div>
      <div className="flex flex-col gap-y-2">
        <Input
          autoFocus
          id="setup-token"
          value={token}
          label="Setup Token"
          type="password"
          placeholder="Setup Token"
          onChange={(event) => {
            setToken(event.target.value);
            setIsInvalid(false);
          }}
        />
        {isInvalid && <div className="text-sm text-panel-text-danger">Invalid setup token.</div>}
      </div>
      <Button
        buttonType="primary"
        buttonSize="normal"
        className="w-full py-2 font-semibold"
        submit
        loading={isPending}
        disabled={token === ''}
      >
        Continue
      </Button>
    </form>
  );
};

export default SetupTokenForm;
