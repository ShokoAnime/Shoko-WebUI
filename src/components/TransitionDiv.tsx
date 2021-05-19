import React from 'react';
import { Transition } from '@headlessui/react';

type Props = {
  children: any;
  className?: string;
  enter?: string;
  enterFrom?: string;
  enterTo?: string;
};

class TransitionDiv extends React.Component<Props> {
  render() {
    const {
      children, className, enter,
      enterFrom, enterTo,
    } = this.props;

    return (
      <Transition
        appear
        show
        enter={enter ?? 'transition-opacity duration-300'}
        enterFrom={enterFrom ?? 'opacity-0'}
        enterTo={enterTo ?? 'opacity-100'}
        className={className}
      >
        {children}
      </Transition>
    );
  }
}

export default TransitionDiv;
