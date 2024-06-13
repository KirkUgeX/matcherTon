/* eslint-disable no-undef */
module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        "node": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended"
    ],
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 12,
        "sourceType": "module"
    },
    "plugins": [
        "react"
    ],
    "rules": {
        "react/react-in-jsx-scope": "off",
        "react/prop-types": "off",
        "indent": [
            "error",
            4
        ],
        "no-trailing-spaces": "error",
        "no-multiple-empty-lines": ["error", { "max": 2, "maxEOF": 0 }],
        "no-unused-vars": "off",
        "linebreak-style": 0,
        "object-curly-spacing": [
            "warn",
            "always"
        ],
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "always"
        ],
        "eol-last": [
            "error",
            "always"
        ]
    }
};
