module.exports = {
  extends: [
    "typescript",
    "plugin:import/errors",
    "plugin:import/warnings"
  ],
  plugins: ["filenames", "jest"],
  parserOptions: {
    sourceType: "module"
  },
  env: {
    "jest": true,
    "node": true
  },
  rules: {
    "indent": 2,
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": 0,
    "react/style-prop-object": 0,
    "import/no-unresolved": [
      0,
      {
        "caseSensitive": false
      }
    ],
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index"
        ]
      }
    ]
  },
  overrides: [
    {
      files: [
        "src/locales/*.json"
      ],
      rules: {
        "i18n-json/sorted-keys": [
          2,
          {
            order: "asc",
            indentSpaces: 2
          }
        ] //sort i18n in asc order
      }
    }
  ]
};
