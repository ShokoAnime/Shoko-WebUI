import React from 'react';
import { Transition } from '@headlessui/react';

type Props = {
  children: any;
  className?: string;
  enter?: string;
  enterFrom?: string;
  enterTo?: string;
};

function TransitionDiv(props: Props) {
  const {
    enter, enterFrom, enterTo, className, children,
  } = props;

  return (
    <Transition
      appear
      show
      enter={enter ?? 'transition-opacity duration-300'}
      enterFrom={enterFrom ?? 'opacity-0'}
      enterTo={enterTo ?? 'opacity-100'}
      // FIXME: Leave transitions don't seem to be working
      leave={enter ?? 'transition-opacity duration-300'}
      leaveFrom={enterTo ?? 'opacity-100'}
      leaveTo={enterFrom ?? 'opacity-0'}
      className={className}
    >
      {children}
    </Transition>
  );
}

export default TransitionDiv;
