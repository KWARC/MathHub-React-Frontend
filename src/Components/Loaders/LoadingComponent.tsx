import * as React from "react";

import { LoadingComponentProps } from "react-loadable";

import ErrorText, { IErrorData } from "./ErrorText";

/**
 * A LoadingComponent is used to indicate to the user that something is being loaded asyncronously.
 *
 * The default LoadingComponent does not display anything until the component is loaded.
 */
export class LoadingComponent
    extends React.Component<
    LoadingComponentProps, IErrorData & {reloading: boolean; loadedPrereqs: boolean}> {
    state = { reloading: false, hasError: false, loadedPrereqs: false };

    private isComponentMounted = true;

    async componentDidMount() {
        await this.loadPreReqs();

        if (this.isComponentMounted)
            this.setState({ loadedPrereqs: true });
    }

    // renders this component
    render() {
        // if we do not have the pre-reqs loaded, return nothing
        if (!this.state.loadedPrereqs) return null;

        const props = this.props;
        if (this.state.hasError)
            return this.renderFatalError();
        else if (props.error)
            return this.renderRejection();
        else if (props.timedOut)
            return this.renderTimeOut(() => {
                this.setState({reloading: true});
                props.retry();
            });
        else if (props.pastDelay)
            return this.renderLoading();
        else
            return null;
    }

    componentWillUnmount() {
        this.isComponentMounted = false;
    }

    // whenever a fatal error occurs, set the appropriate error state
    componentDidCatch(error: Error, info: React.ErrorInfo) {
        if (this.isComponentMounted)
            this.setState({ hasError: true, error, info});
    }

    // a method that can be used to asyncronously load some loader display prerequisites
    protected async loadPreReqs(): Promise<void> {
        return;
    }

    // renders a fatal error
    protected renderFatalError(): React.ReactNode {
        return null;
    }

    // renders an error that has been rejected
    protected renderRejection(): React.ReactNode {
        return null;
    }

    /**
     * renders a timed out component
     * @param retry function to retry loading the promise
     */
    protected renderTimeOut(retry: () => void): React.ReactNode {
        return null;
    }

    // renders a component that is loading
    protected renderLoading(): React.ReactNode {
        return null;
    }
}

// Properties for a spinning loader
export interface ISpinningLoaderProps {
    loadingTitle?: string;
    loadingMessage?: string;

    timeoutTitle?: string;
    timeoutMessage?: string;
    retryMessage?: string;

    errorTitle?: string;
    errorMessage?: string | true;
}

/**
 * Creates a spinning loader using semantic-ui.
 */
export function createSpinningLoader(
    props: ISpinningLoaderProps,
): typeof LoadingComponent {
    return class extends LoadingComponent {
        private semanticUI?: typeof import ("semantic-ui-react");

        protected async loadPreReqs() {
            this.semanticUI = await import("semantic-ui-react");
        }

        // renders an uncaught error in the child component
        protected renderFatalError() {
            if (!this.semanticUI) return null;
            const Icon = this.semanticUI.Icon;
            const Message = this.semanticUI.Message;

            return (
                <Message negative icon>
                    <Icon name="exclamation triangle" />
                    <Message.Content>
                        <Message.Header>{props.errorTitle || "Something went wrong"}</Message.Header>
                        <ErrorText message={props.errorMessage} {...this.state} />
                    </Message.Content>
                </Message>
            );
        }

        // renders the rejection of the promise
        protected renderRejection() {
            if (!this.semanticUI) return null;

            const Icon = this.semanticUI.Icon;
            const Message = this.semanticUI.Message;

            const isProduction = process.env.NODE_ENV === "production";

            // in production, we simply show the error message
            // in devel, we show the proper error description
            const message = isProduction ?
                (props.errorMessage || "Sorry for the inconvenience") :
                this.props.error.toString();

            return (
                <Message negative icon>
                    <Icon name="exclamation triangle" />
                    <Message.Content>
                        <Message.Header>{
                            props.errorTitle || "Something went wrong"
                        }</Message.Header>
                        {message}
                    </Message.Content>
                </Message>
            );
        }

        // renders the promise having timed out
        protected renderTimeOut(retry: () => void) {
            if (!this.semanticUI) return null;

            const Button = this.semanticUI.Button;
            const Icon = this.semanticUI.Icon;
            const Message = this.semanticUI.Message;

            return (
                <Message icon>
                    <Icon name="circle notched" loading />
                    <Message.Content>
                        <Message.Header>{
                            props.timeoutTitle || "Loading is taking longer than usual"
                        }</Message.Header>
                        <Button
                            secondary
                            size="mini"
                            loading={this.state.reloading}
                            onClick={retry}
                        >
                            Try again
                        </Button>
                        {
                            this.state.reloading ?
                                (props.retryMessage || "Retrying ...") :
                                (props.timeoutMessage || "You can try again or re-load the page. ")
                        }
                    </Message.Content>
                </Message>
            );
        }

        // renders the component loading
        protected renderLoading() {
            if (!this.semanticUI) return null;

            const Icon = this.semanticUI.Icon;
            const Message = this.semanticUI.Message;

            return (
                <Message icon>
                    <Icon name="circle notched" loading />
                    <Message.Content>
                        <Message.Header>{
                            props.loadingTitle || "Loading"
                        }</Message.Header>

                        {
                            props.loadingMessage || "This should not take more than a couple seconds. "
                        }
                    </Message.Content>
                </Message>
            );
        }
    };
}
