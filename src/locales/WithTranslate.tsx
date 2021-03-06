import React from "react";

import annotateHOC from "../utils/HOC";
import { Locale, defaultLocale } from ".";
import { translate } from "./translate";

// =====================
// Using locale
// =====================

export interface TranslateProps {
    t: (message: string, vars?: Record<string, string>) => string;
}

export function WithTranslate<P extends TranslateProps>(
    Component: React.ComponentType<P>,
): React.ComponentType<Omit<P, keyof TranslateProps>> {
    return annotateHOC(
        class extends React.Component<Omit<P, keyof TranslateProps>> {
            static contextType = LocaleContext;
            context!: LocaleContextProps;
            render() {
                const t = translate.bind(undefined, this.context.localeData);

                const props = {
                    ...this.props,
                    t: t,
                } as P;

                return <Component {...props} />;
            }
        },
        "WithTranslate",
        Component,
    );
}

// =====================
// Getting locale
// =====================

export interface LocaleContextProps {
    locale: Locale;
    localeData: Record<string, string>;
}
export const LocaleContext = React.createContext<LocaleContextProps>({ locale: defaultLocale, localeData: {} });
