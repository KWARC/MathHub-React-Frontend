import * as React from "react";

export interface IDataComponentProps<T> {
    children: ((data: T) => React.ReactNode);
}

// TODO: Check if this is needed

/** generates a Component that renders given some children */
export default function DataComponent<T>(data: T): React.ComponentClass<IDataComponentProps<T>> {
    return class extends React.Component<IDataComponentProps<T>> {
        public render() {
            return this.props.children(data);
        }
    };
}
