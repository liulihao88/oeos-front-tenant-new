const path = require('path')
const env = process.env.NODE_ENV
const { buildInfos } = require('./src/utils/buildInfo.js')
const target = 'https://10.0.11.33:8008/'
// const target = 'https://10.0.11.102:8008/'

const publicPath = '/tenant'
const TerserPlugin = require('terser-webpack-plugin') // 去除线上console和debugger
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
const smp = new SpeedMeasurePlugin() // 分析每个模块的打包用时
const { codeInspectorPlugin } = require('code-inspector-plugin')
module.exports = {
  publicPath,
  outputDir: 'tenant',
  assetsDir: 'static',
  indexPath: 'index.html',
  filenameHashing: false,
  lintOnSave: false,
  runtimeCompiler: false,
  productionSourceMap: false,
  css: {
    loaderOptions: {
      sass: {
        sassOptions: {
          includePaths: [
            './node_modules',
            './src/assets',
            './src/assets/scss/style.scss',
            './src/assets/scss/Sansation-Light.ttf',
          ],
        },
      },
      scss: {
        // additionalData: '@import "@/assets/scss/skin/style.scss";'
      },
      postcss: {
        plugins: [
          require('autoprefixer')({
            //自动添加前缀
            overrideBrowserslist: ['>0.01%'],
          }),
        ],
      },
    },
  },
  configureWebpack: (config) => {
    config.module.noParse = /^(vue|vue-router|vuex|vuex-router-sync|lodash|echarts|axios|view-design)$/
    if (env === 'production') {
      config.plugins.push(smp)
      config.optimization = {
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: Infinity,
          minSize: 20000,
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                // get the name. E.g. node_modules/packageName/not/this/part.js
                // or node_modules/packageName
                const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1]
                // npm package names are URL-safe, but some servers don't like @ symbols
                return `npm.${packageName.replace('@', '')}`
              },
            },
          },
        },
        minimizer: [
          new TerserPlugin({
            terserOptions: {
              compress: {
                drop_console: true,
                drop_debugger: true,
              },
            },
          }),
        ],
      }
    } else {
    }
    config.resolve.alias['@themeConfig'] = path.resolve(__dirname, 'themeConfig.js')
    config.resolve.alias['@core'] = path.resolve(__dirname, 'src/@core')
    config.resolve.alias['@'] = path.resolve(__dirname, 'src')
    config.resolve.alias['@validations'] = path.resolve(__dirname, 'src/@core/utils/validations/validations.js')
    config.resolve.alias['@axios'] = path.resolve(__dirname, 'src/libs/axios')
  },
  chainWebpack: (config) => {
    config.module
      .rule('vue')
      .use('vue-loader')
      .loader('vue-loader')
      .tap((options) => {
        options.transformAssetUrls = {
          img: 'src',
          image: 'xlink:href',
          'b-avatar': 'src',
          'b-img': 'src',
          'b-img-lazy': ['src', 'blank-src'],
          'b-card': 'img-src',
          'b-card-img': 'src',
          'b-card-img-lazy': ['src', 'blank-src'],
          'b-carousel-slide': 'img-src',
          'b-embed': 'src',
        }
        return options
      })
      .end()
    // config.module
    //     .rule("images")
    //     .use('file-loader')
    //     .loader('url-loader')
    //     .options({
    //         limit: 10000,
    //         fallback: {
    //             loader: 'file-loader',
    //             options: {
    //                 name: 'static/img/[name].[hash:8].[ext]'
    //             }
    //         }
    //     })
    //     .end()
    // config.module
    //     .rule('images')
    //     .use('image-webpack-loader')
    //     .loader('image-webpack-loader')
    //     .options({
    //         bypassOnDebug: env == "development" ? false : true
    //     })
    //     .end()
    // 增加打包信息
    config.plugin('html').tap((args) => {
      args[0].buildInfos = buildInfos
      return args
    })
    config.plugin('code-inspector-plugin').use(
      codeInspectorPlugin({
        bundler: 'webpack',
      }),
    )
  },
  transpileDependencies: ['vue-echarts', 'resize-detector'],
  devServer: {
    open: false,
    host: '0.0.0.0',
    port: 8077,
    hot: true,
    hotOnly: true,
    proxy: {
      [process.env.VUE_APP_BASE_API]: {
        // 后端服务
        target,
        ws: true,
        secure: false,
        changOrigin: true,
        pathRewrite: {
          [`^${process.env.VUE_APP_BASE_API}`]: '',
        },
      },
    },
  },
}
