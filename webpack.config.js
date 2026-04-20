const path = require('path');

module.exports = {
    mode: 'production',
    entry: path.resolve(__dirname, 'src', 'index.ts'),
    output: {
        filename: 'pantry-card.js',
        path: path.resolve(__dirname),
    },
    optimization: {
        minimize: true,
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx|ts|tsx)$/,
                use: [{ loader: 'minify-html-literals-loader' }],
            },
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
            },
        ],
    },
    resolve: {
        extensions: ['.js', '.ts'],
    },
};
