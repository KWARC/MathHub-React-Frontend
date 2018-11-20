import * as React from "react";
import { Route, RouteComponentProps, Switch } from "react-router";

import { Module } from "../../Types/react";
import { CreateSpinningLoader } from "../Loaders";

// A dictionary specifying routes
interface IRouteDict {
    [url: string]: TReactRoute;
}


// a single react route
type TReactRoute = (TRouteClass | ITitledReactPromise) & Partial<IRouteProps>;
interface ITitledReactPromise {
    (): Promise<Module<TRouteClass>>;

    // title of the route while loading
    routeTitle: string;
}
type TRouteClass = React.ComponentClass | React.ComponentClass<RouteComponentProps<{id: string}>>;

// properties of a route
interface IRouteProps {
    // is the route devel only?
    devel: boolean;
}

// checks if a route is a promise route
function isComponentPromise(route: TReactRoute): route is ITitledReactPromise {
    return typeof route === "function" && route.hasOwnProperty("routeTitle");
}

// turns a routing dictonary into a <switch> element
export default class DictToSwitch extends React.Component<{routes: IRouteDict; urlMaker(spec: string): string}> {
    render() {
        const { routes, urlMaker } = this.props;

        return (
            <Switch>{
                Object.keys(routes).map((key: string) => {
                    // if the route is devel only, but we are not in devel, then return
                    const value = routes[key];
                    if (value.devel && process.env.NODE_ENV === "production")
                        return null;

                    // the url for the route, make it a library route unless we already have it
                    const url = (key.startsWith("/") ? key : urlMaker(key));

                    // the route for this url, either the given route or a lazy loader for it
                    const RouteComponent: TRouteClass = isComponentPromise(value) ?
                        // tslint:disable-next-line:no-any
                        CreateSpinningLoader<any>(value.routeTitle, value) : value;

                    // and build the route object
                    return <Route key={key} exact path={url} component={RouteComponent} />;
                })
            }</Switch>
        );
    }
}