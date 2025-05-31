import React from 'react';
import { Transition } from '@headlessui/react';

type Props = {
  children: React.ReactNode;
  className?: string;
  enter?: string;
  enterFrom?: string;
  enterTo?: string;
  show?: boolean;
  appear?: boolean;
};

const TransitionDiv = (props: Props) => {
  const {
    appear,
    children,
    className,
    enter,
    enterFrom,
    enterTo,
    show,
  } = props;

  return (
    <Transition
      appear={appear ?? true}
      show={show ?? true}
      enter={enter ?? 'transition-opacity'}
      enterFrom={enterFrom ?? 'opacity-0'}
      enterTo={enterTo ?? 'opacity-100'}
      leave={enter ?? 'transition-opacity'}
      leaveFrom={enterTo ?? 'opacity-100'}
      leaveTo={enterFrom ?? 'opacity-0'}
    >
      <div className={className}>
        {children}
      </div>
    </Transition>
  );
};

export default TransitionDiv;
