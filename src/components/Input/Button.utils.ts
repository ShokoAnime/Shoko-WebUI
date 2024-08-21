export type ButtonType = 'primary' | 'secondary' | 'danger';
export type SizeType = 'normal' | 'small';

export const buttonTypeClasses: Record<ButtonType, string> = {
  primary:
    'bg-button-primary text-button-primary-text border-2 !border-button-primary-border enabled:hover:bg-button-primary-hover',
  secondary:
    'bg-button-secondary text-button-secondary-text border-2 !border-button-secondary-border enabled:hover:bg-button-secondary-hover',
  danger:
    'bg-button-danger text-button-danger-text border-2 !border-button-danger-border enabled:hover:bg-button-danger-hover',
};

export const buttonSizeClasses: Record<SizeType, string> = {
  normal: 'px-4 py-2',
  small: ' px-4 py-1',
};
