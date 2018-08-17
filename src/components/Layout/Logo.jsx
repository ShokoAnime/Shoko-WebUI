// @flow
import React from 'react';
import { Content, Image, Heading, Media } from 'react-bulma-components';
import Link from '../Link/Link';


class Logo extends React.Component<{}> {
  render() {
    return (
      <Media>
        <Media.Item renderAs="figure" position="left">
          <Image renderAs="p" size={64} alt="64x64" src="/logo.png" />
        </Media.Item>
        <Media.Item>
          <Content>
            <Heading size={4}>Shoko</Heading>
            <Heading subtitle size={6}>Server</Heading>
          </Content>
        </Media.Item>
      </Media>
    );
  }
}

export default Logo;
