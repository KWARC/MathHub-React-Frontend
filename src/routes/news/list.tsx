
import * as React from "react";

import { RouteComponentProps } from "react-router";

import { withContext } from "../../context";
import { ILibraryRouteProps } from "../library/structure/links";

import NewsClient, { INewsItem } from "../../api/news";

import { LoadWithSpinner } from "../../components/common/lazy";
import { Nav } from "../../components/common/nav";

import { Button, Card } from "semantic-ui-react";
import { MHTitle } from "../../utils/title";

class NewsList extends React.Component<ILibraryRouteProps> {
    /** the client to receive data from */
    private client: NewsClient;

    constructor(props: ILibraryRouteProps) {
        super(props);
        this.client = new NewsClient(props.context.config.client.NEWS_URL);
        this.getNews = this.getNews.bind(this);
    }

    private getNews() {
        return this.client.loadAll();
    }

    public render() {
        return (
            <MHTitle title={"News"}>
                <LoadWithSpinner
                    title={"News"}
                    promise={this.getNews}
                    errorMessage={true}
                >{(items: INewsItem[]) => <NewsItemList items={items} />}
                </LoadWithSpinner>
            </MHTitle>
        );
    }
}

export default withContext<RouteComponentProps<{id: string}>>(NewsList);

class NewsItemList extends React.Component<{items: INewsItem[]}> {
    public render() {
        const { items } = this.props;
        return <Card.Group>{items.map((item) => <NewsItemLink key={item.id} item={item} />)}</Card.Group>;
    }
}

function NewsItemLink(props: {item: INewsItem}) {
    const { id, title, date } = props.item;
    const theDate = new Date(0); // The 0 there is the key, which sets the date to the epoch
    theDate.setUTCSeconds(date);
    return (
        <Card>
            <Card.Header >{title}</Card.Header>
            <Card.Meta>{theDate.toDateString()}</Card.Meta>
            <Card.Description>
                <Button as={Nav} to={"/news/" + id}>Show more</Button>
            </Card.Description>
        </Card>
    );
}