module.exports = {
    entry: {
        'main': './main.ts'
    },
    devtool: 'inline-source-map',

    output: { filename: 'bundle.js' },
    resolve: {
        extensions: ['.js', '.ts', '.d.ts', '.tsx', '.jsx', '.css', '.less', '.scss'],
        modules: ['node_modules']
    },
    module: {
        rules: [/\.js$/, /\.ts$/, /\.d.ts$/].map(ext => ({
            test: ext,
            exclude: /node_modules/, use: [
                'ts-loader'
            ]
        }))
    }
};
