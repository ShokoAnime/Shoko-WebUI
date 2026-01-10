import React from 'react';

import TransitionDiv from '@/components/TransitionDiv';

import Footer from './Footer';

const DataCollection = () => (
  <>
    <title>First Run &gt; Data Collection | Shoko</title>
    <TransitionDiv className="flex max-w-[38rem] flex-col justify-center gap-y-6">
      <div className="text-xl font-semibold">Data Collection</div>
      <div className="text-justify">
        Shoko is an open-source project that is developed by volunteers during their free time. In order to improve
        Shoko more effectively, we have implemented&nbsp;
        <a
          href="https://sentry.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-panel-text-primary hover:underline"
        >
          Sentry.io
        </a>
        , which is a third-party service that helps track errors and monitor performance.
      </div>
      <div className="text-justify">
        We understand that data privacy is a significant concern for many people. Therefore, we want to be transparent
        about the data we collect to allay any fears. The information we gather pertains to how Shoko is used, such as
        error messages and performance metrics. This data allows us to swiftly identify and resolve issues and
        prioritize improvements to make the software more stable and user-friendly.
      </div>
      <div className="text-justify">
        We want to assure our users that we take data privacy seriously and only collect non-identifiable information to
        improve Shoko, meaning that we don&apos;t collect any personal information that could be used to identify you.
        We&apos;re not interested in knowing the specific titles in your collection or the content you watch. Our sole
        objective is to improve Shoko, and the data we collect will help us achieve this goal.
      </div>
      <Footer nextPage="" finish />
    </TransitionDiv>
  </>
);

export default DataCollection;
