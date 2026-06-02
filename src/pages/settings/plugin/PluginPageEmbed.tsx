import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';

import { usePluginPagesForPluginQuery } from '@/core/react-query/plugin/queries';

const PluginPageEmbed = () => {
  const { pageId = '', pluginId = '' } = useParams();

  const { data: pages, isPending } = usePluginPagesForPluginQuery(pluginId);

  const page = pages?.find(pgEntry => pgEntry.ID === pageId);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState<number | null>(null);

  // Reset height when navigating to a different page
  useEffect(() => {
    setIframeHeight(null);
  }, [pluginId, pageId]);

  // Same-origin: track content height via ResizeObserver on the iframe document.
  // Cross-origin iframes throw on contentDocument access — caught silently.
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return undefined;

    let resizeObserver: ResizeObserver | undefined;

    const setupObserver = () => {
      try {
        const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
        if (!doc?.body) return;

        const updateHeight = () => {
          const height = doc.body.scrollHeight + 48; // We have a 3rem margin we need to negate.
          if (height > 0) setIframeHeight(height);
        };

        resizeObserver?.disconnect();
        resizeObserver = new ResizeObserver(updateHeight);
        resizeObserver.observe(doc.body);
        updateHeight();
      } catch {
        // Cross-origin — contentDocument inaccessible, rely on postMessage
      }
    };

    // Try immediately — catches the case where the iframe already loaded
    // before this effect ran (race: commit DOM → browser loads → effect runs).
    setupObserver();

    // Also listen for load — fires when the iframe finishes loading.
    iframe.addEventListener('load', setupObserver);
    return () => {
      iframe.removeEventListener('load', setupObserver);
      resizeObserver?.disconnect();
    };
  }, [pluginId, pageId, pages]);

  // Cross-origin: listen for postMessage from cooperating plugin pages.
  // Plugin pages send: { type: 'shoko-plugin-resize', height: <number> }
  // We only accept messages from the origin of the currently embedded page.
  useEffect(() => {
    if (!page?.Url) return undefined;

    let expectedOrigin: string;
    try {
      expectedOrigin = new URL(page.Url).origin;
    } catch {
      return undefined;
    }

    const handler = (event: MessageEvent) => {
      if (event.origin !== expectedOrigin) return;

      const data: unknown = event.data;
      if (
        typeof data === 'object'
        && data !== null
        && 'type' in data
        && data.type === 'shoko-plugin-resize'
        && 'height' in data
        && typeof data.height === 'number'
      ) {
        setIframeHeight(data.height);
      }
    };
    globalThis.addEventListener('message', handler);
    return () => globalThis.removeEventListener('message', handler);
  }, [page]);

  if (isPending) {
    return (
      <div className="flex grow items-center justify-center text-panel-text-primary">
        <Icon path={mdiLoading} spin size={5} />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex grow items-center justify-center text-panel-text-primary">
        Plugin page not found.
      </div>
    );
  }

  return (
    <div className="-m-6 w-[calc(100%+3rem)] rounded-lg">
      <iframe
        ref={iframeRef}
        src={page.Url}
        title={page.Name}
        className="w-full rounded-lg"
        style={{ height: iframeHeight ?? undefined }}
      />
    </div>
  );
};

export default PluginPageEmbed;
