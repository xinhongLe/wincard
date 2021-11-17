const StyleLintPlugin = require("stylelint-webpack-plugin");

module.exports = {
    publicPath: "./",
    productionSourceMap: false,
    css: {
        extract: {
            filename: "[name].css"
        },
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
    chainWebpack: config => {
        config.module
            .rule("images")
            .use("url-loader")
            .loader("url-loader")
            .tap(options => Object.assign(options, { limit: 51200 }));
    },
    configureWebpack: {
        externals: process.env.NODE_ENV === "development" ? [] : [
            "vue", 
            "vuex", 
            "ant-design-vue", 
            "@icon-park/vue-next", 
            "@icon-park/vue-next/es/runtime", 
            "chartist", 
            "clipboard", 
            "crypto-js",
            "dexie",
            "file-saver",
            "hfmath",
            "mitt",
            "pptxgenjs",
            "prosemirror-commands",
            "prosemirror-dropcursor",
            "prosemirror-gapcursor",
            "prosemirror-history",
            "prosemirror-inputrules",
            "prosemirror-model",
            "prosemirror-schema-basic",
            "prosemirror-schema-list",
            "prosemirror-state",
            "prosemirror-view",
            "register-service-worker",
            "svg-arc-to-cubic-bezier",
            "svg-pathdata",
            "tinycolor2",
            "vuedraggable",
            "ali-oss",
            "spark-md5",
            "axios"
        ],
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
