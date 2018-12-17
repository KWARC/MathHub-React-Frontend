import getConfig from "next/config";
import dynamic from "next/dynamic";

import { IArchiveRefProps } from "./IArchiveRefProps";

let PageArchiveRef: React.ComponentClass<IArchiveRefProps>;

switch (getConfig().publicRuntimeConfig.theme) {
    default:
        PageArchiveRef = dynamic(import("../../../themes/plain/Pages/Library/ArchiveRef"));
}

export default PageArchiveRef;
