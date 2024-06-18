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
                exclude: /(node_modules|.ejs|.*\.graphql$|.*\.gql$)/,
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
            },
            {
                exclude: [/\.(js|mjs|jsx|ts|tsx|gql|graphql)$/, /\.html$/, /\.json$/]
            }
        ],
    },
    resolve : {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.css']
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'public/index.html.ejs'
        })
    ]
};
