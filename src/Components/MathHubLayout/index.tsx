import * as React from "react";

// the parts of the page to be rendered
import Body from "./Body";
import Footer from "./Footer";
import Header from "./Header";

export default class MathHubLayout extends React.Component {
    render() {
        return (
            <>
                <Header />
                <Body>{this.props.children}</Body>
                <Footer />
            </>
        );
    }
}

export { BreadCrumbsFill, TextFill, TitleFill } from "./Slots";