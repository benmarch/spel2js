import path from 'path';
import fs from 'fs';
import { BannerPlugin } from 'webpack';
import nodeExternals from 'webpack-node-externals';
import bowerExternals from 'webpack-bower-externals';

export default {
    entry: './src/main.js',
    output: {
        path: path.resolve('./dist'),
        filename: 'spel2js.js',
        library: 'spel2js',
        libraryTarget: 'umd'
    },
    externals: [bowerExternals(), nodeExternals()],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                    },
                ],
            },
            // TODO (BHM 9/26/17): implement ESLint before 1.0.0
            /*{
                test: /\.js$/,
                enforce: 'pre',
                exclude: /node_modules|build/,
                use: [
                    {
                        loader: 'eslint-loader',
                        options: {
                            fix: false,
                        },
                    },
                ],
            },*/
        ],
    },
    plugins: [
        new BannerPlugin({
            banner: fs.readFileSync(path.resolve('./license-banner.txt'), 'utf-8'),
            raw: true
        })
    ],
};