import { NextContext } from "next";
import * as React from "react";

import { default as LicenseTxt } from "../../LICENSE.txt";
import getDerivedParameter, { failed, IDerivedParameter, statusCode } from "../../src/utils/getDerivedParameter";

import LayoutBody from "../../src/theming/Layout/LayoutBody";
import LayoutFailure from "../../src/theming/Layout/LayoutFailure";
import PageLegalNotices from "../../src/theming/Pages/Legal/PageLegalNotices";

type INoticesProps = IDerivedParameter<string | false>;

export default class Notices extends React.Component<INoticesProps> {
    static async getInitialProps({res, query}: NextContext): Promise<INoticesProps> {
        return getDerivedParameter(
            undefined,
            async (_: string) => {
                try {
                    return (await import("../../src/assets/generated/notices.txt")).default;
                } catch (e) {
                    return false;
                }
            },
            query,
            res,
        );
    }
    static readonly crumbs = [{href: "/", title: "Home"}];
    render() {
        if (failed(this.props)) return (
            <LayoutFailure
                crumbs={Notices.crumbs}
                statusCode={statusCode(this.props.status)}
                status={this.props.status}
            />
        );

        const {item} = this.props;

        return (
            <LayoutBody crumbs={Notices.crumbs} title={["Notices"]}>
                <PageLegalNotices notices={item || undefined} license={LicenseTxt} />
            </LayoutBody>
        );
    }
}