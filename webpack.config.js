import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';

const isDevelopment = process.env.NODE_ENV !== 'production';

const __dirname = path.resolve(); // Correctly resolve __dirname

export default {
  entry: './src/index.jsx',
  output: {
    path: path.resolve(__dirname, 'build/static'),
    filename: 'bundle.js', // Ensure you have a filename specified
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              ['@babel/preset-react', { runtime: 'automatic' }],
              '@babel/preset-typescript'
            ],
            plugins: [isDevelopment && 'react-refresh/babel'].filter(Boolean)
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(gql|graphql)$/,
        exclude: /node_modules/,
        use: {
          loader: 'graphql-tag/loader',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.css'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/index.html.ejs',
    }),
    isDevelopment && new ReactRefreshWebpackPlugin()
  ].filter(Boolean),
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'public'), // Adjust to your public directory
    },
    hot: true, // Enable hot reloading
    historyApiFallback: true, // Support for React Router (if using)
    port: 3001, // Optional: specify your preferred port,
    proxy: [{
      '/' : 'http://localhost:3000'
    }]
  },
};
