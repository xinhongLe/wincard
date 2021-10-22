const StyleLintPlugin = require("stylelint-webpack-plugin");

module.exports = {
    publicPath: "./",
    css: {
        loaderOptions: {
            sass: {
                prependData: `
                                @import "~@/assets/styles/variable.scss";
                                @import "~@/assets/styles/mixin.scss";
                            `
            },
            less: {
                lessOptions: {
                    modifyVars: {
                        "primary-color": "#d14424",
                        "text-color": "#41464b",
                        "font-size-base": "13px",
                        "border-radius-base": "2px"
                    },
                    javascriptEnabled: true
                }
            }
        }
    },
    chainWebpack: (config) => {
        config.module
            .rule("images")
            .use("url-loader")
            .loader("url-loader")
            .tap((options) => Object.assign(options, { limit: 5120 }));
    },
    configureWebpack: {
        plugins: [
            new StyleLintPlugin({
                files: ["src/**/*.{vue,html,css,scss,sass,less}"],
                failOnError: false,
                cache: false,
                fix: false
            })
        ]
    }
};
