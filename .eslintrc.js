module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: [
        "plugin:vue/vue3-essential",
        "@vue/standard",
        "@vue/typescript/recommended"
    ],
    parserOptions: {
        ecmaVersion: 2020
    },
    rules: {
        "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
        "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
        indent: ["error", 4],
        semi: ["error", "always"],
        quotes: [2, "double"],
        "space-before-function-paren": [
            "error",
            {
                named: "never",
                anonymous: "never",
                asyncArrow: "always"
            }
        ],
        "dot-notation": [0, { allowKeywords: false, allowPattern: "" }],
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "no-unmodified-loop-condition": "off",
        "standard/no-callback-literal": "off"
    }
};
