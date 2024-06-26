import React, { Component } from "react";
import fetch from 'isomorphic-fetch';
import ApolloAppProvider from './apollo/apollo-provider';
import {Message} from './client-graphql/graphql-components';


type AppState = {
    apiResponse: string;
}

class App extends Component<Record<string, never>, AppState> {
    callAPI() {
        fetch("http://localhost:3000/testApi")
            .then(res => res.text())
            .then (res => this.setState({apiResponse: res}))
            .catch(err => err);
    }
    componentDidMount() {
        this.callAPI();
    }

    render() {
        const apiResponse = this.state == null ? "" : this.state.apiResponse;

        return (
            <ApolloAppProvider>
            <div className="app">
                <header>
                    <h1 className="title">Welcome to React</h1>
                </header>
                <Message />
            </div>
            </ApolloAppProvider>
        );
    }
}

export default App;