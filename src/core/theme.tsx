// Theme for Material Tailwind
// The theme doesn't work if this file is .ts instead of .tsx

const input = {
  styles: {
    base: {
      input: {
        borderColor: 'placeholder-shown:border-background-border placeholder-shown:border-t-background-border',
      },
      label: {
        color: 'text-font-main peer-focus:text-highlight-1 peer-placeholder-shown:text-font-main',
        before: 'before:text-highlight-1 peer-focus:before:text-highlight-1',
        after: 'after:text-highlight-1 peer-focus:after:text-highlight-1',
      },
    },
  },
};

export const theme = {
  input,
};
