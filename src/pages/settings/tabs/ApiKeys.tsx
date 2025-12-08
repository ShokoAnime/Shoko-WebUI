import React, { useEffect, useState } from 'react';
import { mdiClipboardTextOutline } from '@mdi/js';
import cx from 'classnames';
import { map } from 'lodash';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import toast from '@/components/Toast';
import { useCreateApiToken, useDeleteApiToken } from '@/core/react-query/auth/mutations';
import { useApiKeyQuery } from '@/core/react-query/auth/queries';
import { copyToClipboard } from '@/core/util';

import type { AuthToken } from '@/core/types/api/authToken';

const UserApiTokens = ({ token }: { token: AuthToken }) => {
  const { isPending, mutate: deleteToken } = useDeleteApiToken();

  const onDeleteClick = () => {
    deleteToken(token.Device, {
      onSuccess: (() => {
        toast.success('API Key Deleted', `API Key ${token.Device} has been deleted!`, {
          autoClose: 3000,
        });
      }),
    });
  };

  return (
    <div className="flex flex-row items-center justify-between">
      <div className="flex w-[90%] flex-col">
        {token.Device}
      </div>
      <Button buttonType="danger" buttonSize="small" onClick={onDeleteClick} loading={isPending}>
        Delete
      </Button>
    </div>
  );
};

const ApiKeys = () => {
  const [deviceName, setDeviceName] = useState('');

  const onDeviceNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDeviceName(event.target.value);
  };

  const {
    data: createdToken,
    isPending: isTokenGenerating,
    isSuccess: isTokenGenerated,
    mutate: createApiToken,
  } = useCreateApiToken();

  const handleCopyToClipboard = () => {
    if (!isTokenGenerated) return;
    copyToClipboard(createdToken)
      .then(
        () =>
          toast.success(
            'API Key has been copied to clipboard!',
            undefined,
            {
              autoClose: 3000,
              toastId: 'api-copied',
            },
          ),
      )
      .catch((error) => {
        console.error(error);
        toast.error('API Key copy failed!');
      });
  };

  const handleTokenGeneration = () => {
    createApiToken(deviceName, {
      onSuccess: () => {
        toast.success('API Key has been generated!', undefined, {
          autoClose: 3000,
          toastId: 'api-generated',
        });
        toast.warning('Copy Your API Key!', 'You won\'t be able to copy this key anymore once you leave this page!', {
          autoClose: false,
          toastId: 'copy-api-key',
        });
      },
    });
  };

  const { data: tokens } = useApiKeyQuery();

  useEffect(() => () => {
    toast.dismiss('copy-api-key');
    toast.dismiss('api-generated');
    toast.dismiss('api-copied');
  }, []);

  return (
    <>
      <title>Settings &gt; API Keys | Shoko</title>
      <div className="flex flex-col gap-y-1">
        <div className="text-xl font-semibold">API Keys</div>
        <div>
          Below are all the API keys utilized by Shoko and other programs/plugins. You can create new ones or remove
          existing ones as needed.
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="flex flex-col gap-y-6">
        <div className="flex items-center font-semibold">Generate API Key</div>
        <div className="flex flex-row justify-between gap-x-2">
          <Input
            id="key-input"
            endIcons={createdToken
              ? [{
                icon: mdiClipboardTextOutline,
                className: 'text-panel-text-primary',
                onClick: handleCopyToClipboard,
              }]
              : undefined}
            className={cx(!isTokenGenerated ? 'w-full xl:w-[65%]' : 'w-[100%]')}
            disabled={!!createdToken}
            onChange={onDeviceNameChange}
            type="text"
            value={createdToken ?? deviceName}
            placeholder="Type a name for your new API key"
          />
          <Button
            buttonType="primary"
            buttonSize="normal"
            className={cx(isTokenGenerated && 'hidden')}
            onClick={handleTokenGeneration}
            disabled={!deviceName || isTokenGenerating}
            loading={isTokenGenerating}
          >
            Generate
          </Button>
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="flex flex-col gap-y-6">
        <div className="flex items-center font-semibold">Issued API Keys</div>
        <div className="flex flex-col gap-y-1">
          {map(tokens, token => <UserApiTokens key={token.Device} token={token} />)}
        </div>
      </div>
    </>
  );
};

export default ApiKeys;
