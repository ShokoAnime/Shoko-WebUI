module.exports = {
  "*.ts?(x)": () => "tsc --noEmit",
  "*.{ts,tsx}": [
    "dprint fmt",
    "eslint --cache"
  ],
  "*.css": "stylelint"
};
