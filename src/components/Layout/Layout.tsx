
import React from 'react';

import Header from './Header';
// import AlertContainer from '../AlertContainer';
import Sidebar from '../Sidebar/Sidebar';

type Props = {
  children?: React.ReactNode;
};

export default (({
  children,
}: Props) => (
  <React.Fragment>
    <div className="flex h-full layout">
      <div className="w-1/5">
        <Sidebar />
      </div>
      <div className="w-4/5 flex flex-col h-full">
        <Header />
        {children}
      </div>
    </div>
  </React.Fragment>
));
