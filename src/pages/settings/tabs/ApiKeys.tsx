import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mdiClipboardTextOutline } from '@mdi/js';
import cx from 'classnames';
import { map } from 'lodash';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import toast from '@/components/Toast';
import { useCreateApiToken, useDeleteApiToken } from '@/core/react-query/auth/mutations';
import { useApiKeyQuery } from '@/core/react-query/auth/queries';
import { copyToClipboard } from '@/core/util';
import useEventCallback from '@/hooks/useEventCallback';

import type { AuthToken } from '@/core/types/api/authToken';

const UserApiTokens = ({ token }: { token: AuthToken }) => {
  const { t } = useTranslation('settings');
  const { isPending, mutate: deleteToken } = useDeleteApiToken();

  const onDeleteClick = useEventCallback(() => {
    deleteToken(token.Device, {
      onSuccess: (() => {
        toast.success(t('apiKeys.deleteSuccess.title'), t('apiKeys.deleteSuccess.message', { device: token.Device }), {
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
      <Button buttonType="danger" buttonSize="small" onClick={onDeleteClick} loading={isPending}>
        {t('apiKeys.delete')}
      </Button>
    </div>
  );
};

const ApiKeys = () => {
  const { t } = useTranslation('settings');
  const [deviceName, setDeviceName] = useState('');

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
    copyToClipboard(createdToken)
      .then(
        () =>
          toast.success(
            t('apiKeys.copied'),
            undefined,
            {
              autoClose: 3000,
              toastId: 'api-copied',
            },
          ),
      )
      .catch((error) => {
        console.error(error);
        toast.error(t('apiKeys.copyFailed'));
      });
  });

  const handleTokenGeneration = useEventCallback(() => {
    createApiToken(deviceName, {
      onSuccess: () => {
        toast.success(t('apiKeys.generated'), undefined, {
          autoClose: 3000,
          toastId: 'api-generated',
        });
        toast.warning(
          t('apiKeys.copyWarning.title'),
          t('apiKeys.copyWarning.message'),
          {
            autoClose: false,
            toastId: 'copy-api-key',
          },
        );
      },
    });
  });

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
        <div className="text-xl font-semibold">{t('apiKeys.title')}</div>
        <div>
          {t('apiKeys.description')}
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="flex flex-col gap-y-6">
        <div className="flex items-center font-semibold">{t('apiKeys.generate.title')}</div>
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
            placeholder={t('apiKeys.generate.placeholder')}
          />
          <Button
            buttonType="primary"
            buttonSize="normal"
            className={cx(isTokenGenerated && 'hidden')}
            onClick={handleTokenGeneration}
            disabled={!deviceName || isTokenGenerating}
            loading={isTokenGenerating}
          >
            {t('apiKeys.generate.button')}
          </Button>
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="flex flex-col gap-y-6">
        <div className="flex items-center font-semibold">{t('apiKeys.issued')}</div>
        <div className="flex flex-col gap-y-1">
          {map(tokens, token => <UserApiTokens key={token.Device} token={token} />)}
        </div>
      </div>
    </>
  );
};

export default ApiKeys;
