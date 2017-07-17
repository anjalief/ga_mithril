var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
entry: {
    main: './static/index.js'
},
output: {
    path: './static',
    filename: 'app.js'
},
module: {
    loaders: [
{
test: /\.json$/,
loader: 'json'
},
{
test: /\.css$/,
loader: ExtractTextPlugin.extract("style-loader", "css-loader")
},
{
test: /\.(jpg|png)$/,
loader: 'file'
},
]
},
resolve: {
    alias: {
        "Chart": path.resolve(__dirname, 'chart.js'),
    }
},
plugins: [
    new ExtractTextPlugin("app.[hash].css")
    ]
};
