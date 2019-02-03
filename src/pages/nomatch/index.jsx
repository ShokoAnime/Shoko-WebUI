// @flow
import React from 'react';
import { Container, Content, Hero } from 'react-bulma-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSadCry,
} from '@fortawesome/free-solid-svg-icons';

const NoMatchPage = () => (
  <Hero size="fullheight" className="nomatch">
    <Hero.Body>
      <Container textAlignment="centered">
        <FontAwesomeIcon icon={faSadCry} />
        <Content renderAs="p">No route found</Content>
      </Container>
    </Hero.Body>
  </Hero>
);

export default NoMatchPage;
