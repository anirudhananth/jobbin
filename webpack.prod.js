const { merge } = require('webpack-merge');
const common = require('./webpack.config.js');

module.exports = merge(common, {
    mode: 'prod',
    devtool: 'cheap-module-source-map'
})