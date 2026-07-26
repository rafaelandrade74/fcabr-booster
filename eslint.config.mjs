import globals from "globals";

const WEBEXT_GLOBALS = {
    chrome: "readonly",
    browser: "readonly", // Firefox alias
};

export default [
    {
        ignores: ["dist/**", "node_modules/**", "scripts/**"],
    },

    // Base — todos os arquivos JS
    {
        files: ["src/**/*.js", "src/**/*.mjs"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.browser,
                __FCABR_DEBUG__: "readonly",
            },
        },
        rules: {
            "no-undef": "error",
            "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            "no-var": "error",
            "prefer-const": "warn",
            "no-console": "warn",
        },
    },

    // Contexto de extensão: content scripts, background, popup
    // Estes arquivos têm acesso às APIs chrome.* / browser.*
    {
        files: [
            "src/content-scripts/**/*.js",
            "src/background/**/*.js",
            "src/options/**/*.js",
            "src/lib/**/*.js",
        ],
        languageOptions: {
            globals: WEBEXT_GLOBALS,
        },
    },

    // inject.js roda no Main World (contexto da página), sem acesso a chrome.*
    // Qualquer referência a `chrome` aqui é um bug.
    {
        files: ["src/content-scripts/inject.js"],
        languageOptions: {
            globals: {
                chrome: "off",
                browser: "off",
            },
        },
        rules: {
            "no-restricted-globals": [
                "error",
                {
                    name: "chrome",
                    message: "inject.js roda no Main World e não tem acesso à API chrome.*",
                },
                {
                    name: "browser",
                    message: "inject.js roda no Main World e não tem acesso à API browser.*",
                },
            ],
        },
    },

    // Config files
    {
        files: ["*.cjs", "*.mjs", "webpack.config.js"],
        languageOptions: {
            sourceType: "commonjs",
            globals: globals.node,
        },
    },
];
