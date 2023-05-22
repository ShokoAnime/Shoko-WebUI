import React from 'react';

import Footer from './Footer';
import TransitionDiv from '@/components/TransitionDiv';

function DataCollection() {

  return (
    <TransitionDiv className="flex flex-col justify-center max-w-[40rem] px-8">
      <div className="font-semibold">Data Collection</div>
      <div className="mt-9 text-justify">
        Shoko is open-source and is worked on by volunteers in our free time so in order to
        more effectively improve Shoko, we&apos;ve implemented two different services for data
        collection. We understand the hesitations a lot of people have with data collection
        services so we&apos;re listing what services we use and what data we collect.
        <br />
        <br />
        We also want to make something very clear, all data collected is non-identifiable.
        We don’t care about what specific titles you have in your collection or what you
        watch. We only care about making Shoko better which is what this data will allow us
        to do.
      </div>
      <div className="mt-9 mb-8">
        <div className="font-bold">Sentry</div>
        <ul>
          <li>- Error information and context</li>
        </ul>
      </div>
      <Footer nextPage="" finish />
    </TransitionDiv>
  );
}

export default DataCollection;
