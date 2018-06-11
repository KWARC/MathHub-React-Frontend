import * as React from "react";

import { Loader } from "../components/common/lazy";
import { MonospaceContainer } from "../components/common/monospace";

import { Context } from "../context";

import { delay } from "../utils/promises";

import { Icon, Message } from "semantic-ui-react";

export function Devel(props: {}) {
    return (
        <>
            This page is intended for debugging purposes only. <br />
            If you are seeing it in production, you did something wrong. <br />

            This page might also have a memory leak.
            You have been warned.

            <h2>Process.Env</h2>
            <MonospaceContainer>{JSON.stringify(process.env, undefined, 4)}</MonospaceContainer>

            <h2>Config</h2>
            <Context.Consumer>{(context) =>
                <MonospaceContainer>{JSON.stringify(context.config, undefined, 4)}</MonospaceContainer>
            }</Context.Consumer>

            <h2>Lazy Loading Tests</h2>

            <h3>Success</h3>
            This component should load.
            <Success />

            <h3>Retry (Timeout)</h3>
            This component should load after the retry button is pressed.
            <Retry />

            <h3>Promise Rejection</h3>
            This component should fail to load after a couple seconds because of promise rejection.
            <Rejection />

            <h3>Fatal Error</h3>
            This component should fail to load because of a fatal error almost immediatly.
            <Fatal />
        </>
    );
}

const loadTimeDelay = 5000;

const Success = Loader("Success Test", () => delay(Promise.resolve(DummyShouldLoad), loadTimeDelay));

const Fatal = Loader("Fatal", () => new Promise<React.SFC<{}>>((reject, resolve) => {
    throw new Error("Intended Failure");
}));

const Rejection = Loader("Rejection", () =>
    delay(Promise.reject<React.SFC<{}>>("Nothing to worry about. "), loadTimeDelay), {
        errorTitle: "Loading has been rejected as intended",
        errorMessage: true,
    });

let hasTriedBefore = false;
const Retry = Loader("Retry", () => {
    hasTriedBefore = !hasTriedBefore; // flip it if we load again
    if (!hasTriedBefore) {
        return delay(Promise.resolve(DummyShouldLoad), loadTimeDelay);
    } else {
        return new Promise<React.SFC<{}>>((reject, resolve) => null);
    }
});

function DummyShouldLoad(props: {}) {
    return (
        <Message success icon>
            <Icon name="check" />
            <Message.Content>
                <Message.Header>Dummy Component</Message.Header>
                The dummy component has been loaded as intended.
            </Message.Content>
        </Message>
    );
}