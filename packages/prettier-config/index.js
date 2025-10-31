module.exports = {
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  printWidth: 100,
  tabWidth: 2,
  arrowParens: "avoid",
  endOfLine: "auto",

  plugins: ["@ianvs/prettier-plugin-sort-imports", "prettier-plugin-tailwindcss"],
  importOrder: [
    "^react$",
    "^next",
    "<THIRD_PARTY_MODULES>",

    "^@repo/(.*)$",

    "^@/(.*)$",

    "^[./]",
    "^[../]",
  ],
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
  importOrderTypeScriptVersion: "5.0.0",
};
