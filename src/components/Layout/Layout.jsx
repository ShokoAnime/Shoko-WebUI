// @flow
import React from 'react';
import type { Node } from 'react';

import Header from './Header';
import Footer from './Footer';
import AlertContainer from '../AlertContainer';

type Props = {
  children?: Node,
}

export default ({ children }: Props) => (
  <React.Fragment>
    <div className="site">
      <Header />
      <div className="site-content">{children}</div>
      <Footer />
    </div>
    <AlertContainer />
  </React.Fragment>
);
