import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSadCry } from '@fortawesome/free-solid-svg-icons';

const NoMatchPage = () => (
  <div>
    <FontAwesomeIcon icon={faSadCry} />
    <p>No route found</p>
  </div>
);

export default NoMatchPage;
