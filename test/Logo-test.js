import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import Link from '../src/components/Link/Link';
import Logo from '../src/components/Layout/Logo';

describe('Logo', () => {
  it('check if it renders', () => {
    expect(
      shallow(
        <Logo />
      ).length
    ).equal(1);
  });

  const wrapper = shallow(<Logo />);
  it('has a Link', () => {
    expect(
      wrapper.find(Link)
    ).to.have.length(1);

  });

  it('with class logo', () => {
    expect(wrapper.find(Link).prop('className')).to.equal('logo');
  });

  it("points to /dashboard", () => {
    expect(wrapper.find(Link).prop('to')).to.equal('/dashboard');
  });
});