import { NextPageContext } from "next";
import * as React from "react";
import intl from "react-intl-universal";

import getDerivedParameter, { failed, IDerivedParameter, statusCode } from "../../src/utils/getDerivedParameter";

import getMathHubConfig from "../../src/context";
import { IGroup } from "../../src/context/LibraryClient/objects";

import LayoutBody from "../../src/theming/Layout/LayoutBody";
import LayoutFailure from "../../src/theming/Layout/LayoutFailure";
import ActionHeader from "../../src/theming/Layout/ActionHeader";
import PageArchiveRef from "../../src/theming/Pages/Library/PageArchiveRef";
import PageGroup from "../../src/theming/Pages/Library/PageGroup";

import { headerProps } from "../../src/lib/library/utils";

type IGroupProps = IDerivedParameter<IGroup>;

export default class Group extends React.Component<IGroupProps> {
  static async getInitialProps({res, query}: NextPageContext): Promise<IGroupProps> {
    return getDerivedParameter(
        "id",
        async (id: string) => getMathHubConfig().libraryClient.getGroup(id),
        query,
        res,
    );
  }
  render() {
    const crumbs = [{href: "/", title: intl.get("home")}, {href: "/library", title: intl.get("library")}];
    if (failed(this.props)) return (
      <LayoutFailure
          crumbs={crumbs}
          statusCode={statusCode(this.props.status)}
          status={this.props.status}
      />
    );

    const { description, declarations: archives, name } = this.props.item;
    const header = <ActionHeader {...headerProps(this.props.item, {description})} />;

    return (
        <LayoutBody crumbs={crumbs} description={description} title={[name]}>
            <PageGroup header={header} item={this.props.item}>
                {archives.map(a => <PageArchiveRef
                    key={a.id}
                    item={a}
                    link={{href: "/library/archive", query: {id: a.id}}}
                />)}
            </PageGroup>
        </LayoutBody>
    );
  }
}
