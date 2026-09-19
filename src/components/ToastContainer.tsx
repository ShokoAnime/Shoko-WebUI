import { Slide, ToastContainer as ToastifyContainer } from 'react-toastify';
import type { ToastPosition } from 'react-toastify';

type Props = {
  toastPosition: ToastPosition;
};

const ToastContainer = ({ toastPosition }: Props) => (
  <ToastifyContainer
    position={toastPosition}
    autoClose={4000}
    transition={Slide}
    className="mt-36 w-118!"
    closeButton={false}
    icon={false}
  />
);

export default ToastContainer;
