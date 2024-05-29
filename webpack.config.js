import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";

const __dirname = import.meta.dirname;

export default {
    entry: "./src/index.jsx",
    output: { path: path.resolve(__dirname, "build/public") },
    module: {
        rules: [
            {
                test: /.(js|jsx|ts|tsx)$/,
                exclude: /(node_modules|.ejs)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env", "@babel/preset-react", "@babel/preset-typescript"],
                    }
                },
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ],
    },
    resolve : {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'public/index.html.ejs'
        })
    ]
};
