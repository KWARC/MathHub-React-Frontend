import Head from "next/head";
import * as React from "react";

// tslint:disable-next-line: no-submodule-imports
import "semantic-ui-css/semantic.min.css";

import MHLink from "../../../lib/components/MHLink";
import { ILayoutBodyProps } from "../../../theming/Layout/ILayoutBodyProps";
import { IMathHubVersion } from "../../../types/config";

import { Header } from "./Header";


export default class LayoutBody extends React.Component<ILayoutBodyProps> {
    render() {
        const { title, crumbs, version, description } = this.props;

        // generate the title
        const titleStr = (title || []).join(" | ");
        const theTitle = title ? `${titleStr} | MathHub` : "MathHub";

        return (
            <>
                <Head>
                    <title>{theTitle}</title>
                    {description && <meta name="description" content={description} />}
                </Head>
                <Header title={title} crumbs={crumbs} />
                <hr />
                <main>
                    {this.props.children}
                </main>
                <hr />
                <footer>
                    <div>
                        <MHLink href="/legal/notices"><a>Notices</a></MHLink>
                        &nbsp;-&nbsp;
                        <MHLink href="/legal/imprint"><a>Imprint</a></MHLink>
                    </div>
                    <div>
                        <small>
                            <MathHubVersion version={version} />
                        </small>
                    </div>
                </footer>
            </>
        );
    }
}

class MathHubVersion extends React.Component<{ version: IMathHubVersion }> {
    render() {
        const { semantic, git, configTime } = this.props.version;
        const cfgTime = new Date(configTime).toISOString();

        let version = `MathHub Version ${semantic} configured at ${cfgTime}`;

        if (git) {
            version += " (from ";
            if (git.dirty === true) version += "dirty ";
            else if (git.dirty === false) version += "clean ";
            version += `commit ${git.hash}`;
            if (git.branch) version += ` on branch ${git.branch}`;
            version += ")";
        }

        return version;
    }
}