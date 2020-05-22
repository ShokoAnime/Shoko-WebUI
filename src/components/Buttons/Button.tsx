import PropTypes from 'prop-types';
import React from 'react';

type Props = {
  className?: string;
  children: any;
  loading?: boolean;
  onClick: () => void;
};

class Button extends React.Component<Props> {
  static propTypes = {
    className: PropTypes.string,
    children: PropTypes.any.isRequired,
    loading: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
  };

  render() {
    const {
      className,
      children,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      loading,
      onClick,
    } = this.props;

    return (
      <React.Fragment>
        <button type="button" className={`${className} focus:shadow-none focus:outline-none`} onClick={onClick}>
          {children}
        </button>
      </React.Fragment>
    );
  }
}

export default Button;
