'use strict';
const Config = require('webpack-chain');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const config = new Config();
const IS_DEV = process.env.NODE_ENV === 'development';
const {resolve} = require('path');
const CWD = process.cwd();
const REG_NODE_MODULES = /node_modules/;
const pkg = require(resolve(CWD, './package.json'));
const { readdirSync, statSync } = require('fs')
const { join } = require('path')

const dirs = p => readdirSync(p).filter(f => statSync(join(p, f)).isDirectory())

config
  .mode(process.env.NODE_ENV)
  .entry('index')
    .add('@/index')
    .end()
  .output
    .library(pkg.name)
    .libraryTarget('umd')
    .path(resolve(CWD, "dist"))
    .filename('[name].js');

config.resolve.extensions
  .add('.js')
  .add('.ts')
  .add('.json');

config.resolve.alias
  .set('@', resolve(CWD, 'src'));

dirs(resolve(__dirname, '../packages')).forEach(name => {
  config.resolve.alias.set(`@harpsealjs/${name}`, resolve(__dirname, `../packages/${name}/lib/index.js`));
});

config.module.rule('js')
  .test(/\.js$/)
  .exclude
    .add(REG_NODE_MODULES)
    .end()
  .use('babel')
    .loader('babel-loader')
    .options({
      presets: ['@babel/preset-env', '@babel/preset-typescript']
    })
    .end();

config.module.rule('ts')
  .test(/\.ts$/)
  .exclude
    .add(REG_NODE_MODULES)
    .end()
  .use('babel')
    .loader('babel-loader')
    .options({
      presets: ['@babel/preset-env', '@babel/preset-typescript']
    })
    .end()
  .use('typescript')
    .loader('ts-loader')
    .options({ transpileOnly: true });

config.when(
  IS_DEV
  ,config => {
    config
      .watchOptions({ ignored: REG_NODE_MODULES })
      .stats({ colors: true })
      .devtool('eval-source-map')
      .devServer
        .contentBase('./public')
        .publicPath('/dist/')
        .hot(true)
        .compress(true)
        .allowedHosts
          .add('localhost')
          .end()
        .port(3456)
        .headers({ 'Access-Control-Allow-Origin': '*' });
    return config;
  }
  ,config => {
    config
      .devtool(false)
      .optimization
        .minimizer('UglifyJsPlugin')
          .use(UglifyJsPlugin, [{
            sourceMap: false,
            cache: true,
            parallel: true,
            uglifyOptions: {
              warnings: false,
              compress: {
                unused: false
              },
              output: {
                ascii_only: true,
                comments: 'some',
                beautify: false,
              },
              mangle: true,
            },
          }])
          .end()
        .end();
    return config;
  }
)

module.exports = config.toConfig();