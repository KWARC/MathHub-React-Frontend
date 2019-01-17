import * as React from "react";

import { Without } from "../types/lib";

/**
 * Adds some extra props to a component
 * @param Component Component to add props to
 * @param extra function to get props with
 */
export function WithExtraProps<M, P extends M>(
    Component: React.ComponentClass<P>,
    extra: ((props: Without<P, M>) => M) | M,
): React.ComponentClass<Without<P, M>> {
    const cmpName = Component.displayName || Component.name;

    return class extends React.Component<Without<P, M>> {
        static displayName = `WithExtraProps(${cmpName})`;
        render() {
            const newProps = (typeof extra === "function") ?
                // we need an extra cast here, since M could be a function type
                (extra as (props: Without<P, M>) => M)(this.props) : extra;

            // tslint:disable-next-line:no-object-literal-type-assertion
            const compProps = {...this.props, ...newProps} as P;

            return <Component {...compProps} />;
        }
    };
}

/**
 * Adds some extra props to a component
 * @param Component Component to add props to
 * @param extra function to get props with
 */
export function WithContextProps<M, P extends M>(
    Component: React.ComponentClass<P>,
    context: React.Context<M>,
): React.ComponentClass<Without<P, M>> {
    return WithExtraContext(Component, context, {});
}

/**
 * Combines the WithExtraProps and WithComponent functions
 * @param Component Component to wrap
 * @param context Context to add
 * @param extra Extra context to add
 */
export default function WithExtraContext<C, M, P extends C & M>(
    Component: React.ComponentClass<P>,
    context: React.Context<C>,
    extra: ((props: Without<P, M>) => M) | M,
): React.ComponentClass<Without<P, C & M>> {
    const cmpName = Component.displayName || Component.name;

    return class extends React.Component<Without<P, C & M>> {
        static displayName =
            `WithExtraContext(${cmpName})`;
        static contextType = context;
        context!: M;
        render() {
            // tslint:disable-next-line:no-object-literal-type-assertion
            const compProps = {...this.props, ...this.context} as Without<P, M>;

            // add more new props to it
            const newProps = (typeof extra === "function") ?
                // we need an extra cast here, since M could be a function type
                (extra as (props: Without<P, M>) => M)(compProps) : extra;

            // tslint:disable-next-line:no-object-literal-type-assertion
            const allProps = {...this.context, ...newProps, ...this.props} as P;

            return <Component {...allProps} />;
        }
    };
}