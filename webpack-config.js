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
test: /\.css$/,
loader: ExtractTextPlugin.extract("style-loader", "css-loader")
},
{
test: /\.(jpg|png)$/,
loader: 'file'
},
]
},
plugins: [
    new ExtractTextPlugin("app.[hash].css")
    ]
};
