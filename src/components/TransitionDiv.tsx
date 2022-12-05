import React from 'react';
import { Transition } from '@headlessui/react';

type Props = {
  children: any;
  className?: string;
  enter?: string;
  enterFrom?: string;
  enterTo?: string;
  show?: boolean;
  appear?: boolean;
};

function TransitionDiv(props: Props) {
  const {
    enter, enterFrom, enterTo, className, children,
    show, appear,
  } = props;

  return (
    <Transition
      appear={appear ?? true}
      show={show ?? true}
      enter={enter ?? 'transition-opacity'}
      enterFrom={enterFrom ?? 'opacity-0'}
      enterTo={enterTo ?? 'opacity-100'}
      // FIXME: Leave transitions don't seem to be working
      leave={enter ?? 'transition-opacity'}
      leaveFrom={enterTo ?? 'opacity-100'}
      leaveTo={enterFrom ?? 'opacity-0'}
      className={className}
    >
      {children}
    </Transition>
  );
}

export default TransitionDiv;
