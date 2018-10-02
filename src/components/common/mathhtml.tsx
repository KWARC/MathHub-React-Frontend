import { default as Parser, TNodeList, TReactElement } from "../../utils/react-html-parser";

import * as React from "react";
import { Popup } from "semantic-ui-react";
import { HTML } from "../../context/api";

export interface IMathHTMLProps {
    /** the html (string) that should be rendered */
    children: HTML;

    /** should we render semantic references, false as default */
    renderReferences?: boolean;

    /** should we render math, defaults to true */
    renderMath?: boolean;

    /** override the default type this element should appear as */
    as?: any;
}

/**
 * An element representing mathmatically relevant text based on html input
 */
export class MathHTML extends React.Component<IMathHTMLProps> {
    constructor(props: IMathHTMLProps) {
        super(props);

        this.replaceHTMLNodes = this.replaceHTMLNodes.bind(this);
        this.replaceLinkNode = this.replaceLinkNode.bind(this);
        this.replaceMathNode = this.replaceMathNode.bind(this);
    }
    private replaceHTMLNodes(node: Node, callback: (nodes: TNodeList) => TReactElement[]) {
        if (node.nodeType !== Node.ELEMENT_NODE) { return; }

        const {renderReferences, renderMath} = this.props;

        if (renderReferences) {
            const linkReplaced = this.replaceLinkNode(node as Element, callback);
            if (linkReplaced) { return linkReplaced; }
        }

        if (renderMath !== false) {
            const mathReplaced = this.replaceMathNode(node as Element, callback);
            if (mathReplaced) { return mathReplaced; }
        }

        return;
    }

    private replaceLinkNode(node: Element, callback: (nodes: TNodeList) => TReactElement[]) {
        if (node.nodeName.toLowerCase() === "a") {
            const href = node.getAttribute("href") || "";
            return (
                <Popup
                    trigger={
                        <a href={href}>{callback(node.childNodes)}</a>}
                    content={<div>{href}</div>}
                />
            );
        }
    }

    private replaceMathNode(node: Element, callback: (nodes: Node[]) => TReactElement[]) {
        if (node.nodeName.toLowerCase() === "math") {
            return <RenderedMath>{node.outerHTML}</RenderedMath>;
        }
    }

    public render() {
        const { children: content, as: asElement} = this.props;

        const children = Parser(content, {replace: this.replaceHTMLNodes}).map(
            (child: React.ReactElement<any>, index: number) => React.cloneElement(child, {key: index}),
        );
        return React.createElement(asElement || React.Fragment, { children });
    }
}

/** renders a single math element */
export class RenderedMath extends React.Component<{children: string}> {
    public render() {
        return <span dangerouslySetInnerHTML={{__html: this.props.children}} />;
    }
}