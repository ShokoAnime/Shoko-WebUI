import React, { useState } from 'react';
import { mdiClipboardTextOutline } from '@mdi/js';
import cx from 'classnames';
import { useCopyToClipboard, useEffectOnce } from 'usehooks-ts';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import toast from '@/components/Toast';
import { useCreateApiToken, useDeleteApiToken } from '@/core/react-query/auth/mutations';
import { useApiKeyQuery } from '@/core/react-query/auth/queries';
import useEventCallback from '@/hooks/useEventCallback';

import type { AuthToken } from '@/core/types/api/authToken';

const UserApiTokens = ({ token }: { token: AuthToken }) => {
  const { isPending, mutate: deleteToken } = useDeleteApiToken();

  const onDeleteClick = useEventCallback(() => {
    deleteToken(token.Device, {
      onSuccess: (() => {
        toast.success('API Key Deleted', `API Key ${token.Device} has been deleted!`, {
          autoClose: 3000,
        });
      }),
    });
  });

  return (
    <div className="flex flex-row items-center justify-between">
      <div className="flex w-[90%] flex-col">
        {token.Device}
      </div>
      <Button buttonType="danger" className="px-2 py-1 text-sm" onClick={onDeleteClick} loading={isPending}>
        Delete
      </Button>
    </div>
  );
};

const ApiKeys = () => {
  const [deviceName, setDeviceName] = useState('');
  const [, copy] = useCopyToClipboard();

  const onDeviceNameChange = useEventCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setDeviceName(event.target.value);
  });

  const {
    data: createdToken,
    isPending: isTokenGenerating,
    isSuccess: isTokenGenerated,
    mutate: createApiToken,
  } = useCreateApiToken();

  const handleCopyToClipboard = useEventCallback(() => {
    if (!isTokenGenerated) return;
    copy(createdToken).then((isCopied) => {
      if (!isCopied) return;
      toast.success('Copied', 'API Key has been copied to clipboard!', {
        autoClose: 3000,
        toastId: 'api-copied',
      });
    }).catch(console.error);
  });

  const handleTokenGeneration = useEventCallback(() => {
    createApiToken(deviceName, {
      onSuccess: () => {
        toast.success('API Generated', 'API Key has been generated!', {
          autoClose: 3000,
          toastId: 'api-generated',
        });
        toast.warning('Copy Your API Key!', 'You won\'t be able to copy this key anymore once you leave this page!', {
          autoClose: false,
          toastId: 'copy-api-key',
        });
      },
    });
  });

  const { data: tokens } = useApiKeyQuery();

  useEffectOnce(() => () => {
    toast.dismiss('copy-api-key');
    toast.dismiss('api-generated');
    toast.dismiss('api-copied');
  });

  return (
    <>
      <div className="text-xl font-semibold">API Keys</div>

      <div className="flex flex-col gap-y-4">
        <div className="font-semibold">Generate API Key</div>
        <div className="flex flex-row justify-between gap-x-2 border-b border-panel-border pb-8">
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
            inputClassName="px-4 py-3"
            onChange={onDeviceNameChange}
            type="text"
            value={createdToken ?? deviceName}
            placeholder="Type a name for your new API key"
          />
          <Button
            buttonType="primary"
            className={cx('px-2 font-semibold', isTokenGenerated && 'hidden')}
            onClick={handleTokenGeneration}
            disabled={!deviceName || isTokenGenerating}
            loading={isTokenGenerating}
          >
            Generate
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-y-4">
        <div className="font-semibold">Issued API Keys</div>
        <div className="flex flex-col gap-y-2">
          {tokens.map(token => <UserApiTokens key={token.Device} token={token} />)}
        </div>
      </div>
    </>
  );
};

export default ApiKeys;
