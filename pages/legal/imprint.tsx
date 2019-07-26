import { NextPageContext } from "next";
import * as React from "react";
import intl from "react-intl-universal";

import getDerivedParameter, { failed, IDerivedParameter, statusCode } from "../../src/utils/getDerivedParameter";

import LayoutBody from "../../src/theming/Layout/LayoutBody";
import LayoutFailure from "../../src/theming/Layout/LayoutFailure";
import PageLegalImprint from "../../src/theming/Pages/Legal/PageLegalImprint";

type IImprintProps = IDerivedParameter<string>;

export default class Imprint extends React.Component<IImprintProps> {
    static async getInitialProps({res, query}: NextPageContext): Promise<IImprintProps> {
        return getDerivedParameter(
            undefined,
            async (_: string) => (await import("../../src/assets/legal/imprint.txt")).default,
            query,
            res,
        );
    }
    static readonly crumbs = [{href: "/", title: intl.get("home")}];
    render() {
        if (failed(this.props)) return (
            <LayoutFailure
                crumbs={Imprint.crumbs}
                statusCode={statusCode(this.props.status)}
                status={this.props.status}
            />
        );

        const {item} = this.props;

        return (
            <LayoutBody crumbs={Imprint.crumbs} title={[intl.get("imprint")]}>
                <PageLegalImprint imprint={item} />
            </LayoutBody>
        );
    }
}
