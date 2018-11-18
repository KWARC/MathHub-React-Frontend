import MMTClient from "../client";

import {
    IApiObject,
    IArchive,
    IArchiveRef,
    IDocument,
    IDocumentParentRef,
    IDocumentRef,
    IGroup,
    IGroupRef,
    IMMTVersionInfo,
    IModule,
    INarrativeElement,
    IOpaqueElement,
    IOpaqueElementRef,
    IReferencable,
    ITag,
    ITagRef,
    ITheory,
    ITheoryRef,
    IView,
    IViewRef,
    URI,
} from "../objects";

import { IMockDataSet, IMockModule, IMockObject, IMockReference } from "./set";

/** An API client to MMT that mocks results by resolving them statically from a given datatset */
export class LazyMockClient extends MMTClient {

    constructor(datasetFactory: () => Promise<IMockDataSet>) {
        super();
        this.datasetFactory = datasetFactory;
    }
    private readonly datasetFactory: () => Promise<IMockDataSet>;

    /** get the MMT Version */
    public getMMTVersion(): Promise<IMMTVersionInfo> {
        return this.loadDataSet().then((d) => d.version);
    }

    // #region "Dataset"
    private dataset: IMockDataSet | undefined;

    /** loads the dataset */
    private async loadDataSet(): Promise<IMockDataSet> {

        // if we already fetched the dataset
        // we can return it immediatly
        if (typeof this.dataset !== "undefined") {
            return this.dataset;
        }

        // else we need to fetch it
        const ds = await this.datasetFactory();
        this.dataset = ds;
        return this.dataset;
    }

    /**
     * gets an object matching a filter from the data set
     * or returns an error message
     * @param getter function to get object from dataset
     * @param errorMessage error to throw when the object does not exist
     */
    private getObjectOfType<T extends IApiObject>(
        getter: (data: IMockDataSet) => IMockObject | undefined,
        kind: (result: IMockObject) => string,
        errorMessage: string,
    ): Promise<T>  {
        return this.loadDataSet().then((ds) => {
            const obj = getter(ds);
            if (typeof obj === "undefined") {
                return Promise.reject(errorMessage);
            } else {
                return Promise.resolve(this.cleanAny<T>(kind(obj), obj, ds));
            }
        });
    }

    // #endregion

    // #region "Cleaners"

    private logMockNotFound(id: string, where: string) {
        // tslint:disable-next-line:no-console
        console.warn(`Mock Dataset: Can not find ${id} in dataset.${where}`);
    }

    private cleanAny<T extends IApiObject>(kind: string, obj: IMockObject, ds: IMockDataSet): T {
        let co: any; // cleaned object
        switch (kind) {
            case "group":
                co = this.cleanGroup(obj, ds);
                break;
            case "tag":
                co = this.cleanTag(obj, ds);
                break;
            case "archive":
                co = this.cleanArchive(obj, ds);
                break;
            case "document":
                co = this.cleanDocument(obj, ds);
                break;
            case "opaque":
                co = this.cleanOpaqueElement(obj, ds);
                break;
            case "theory":
                co = this.cleanTheory(obj, ds);
                break;
            case "view":
                co = this.cleanView(obj, ds);
                break;
            default:
                // tslint:disable-next-line:no-console
                console.warn(`Mock Dataset: Got object of unknown kind ${kind}, skipping cleanup. `);
                co = obj;
                break;
        }

        // this cast is type safe because of clean* methods do not change type
        return co as T;
    }

    private cleanGroupRef(group: IMockReference, ds: IMockDataSet): IGroupRef {
        const actual = ds.groups.find((g) => g.id === group.id)!;
        if (!actual) { this.logMockNotFound(group.id, "groups"); }

        return {
            kind: "group",
            parent: null,
            ref: true,

            id: actual.id,
            name: actual.name,
            title: actual.title,
            teaser: actual.teaser,
        };
    }

    private cleanTagRef(tag: IMockReference, ds: IMockDataSet): ITagRef {
        if (!tag.id.startsWith("@")) {
            this.logMockNotFound(tag.id, "tags");
        }

        return {
            kind: "tag",
            parent: null,
            ref: true,

            id: tag.id,
            name: tag.id.substr(1),
        };
    }

    private cleanArchiveRef(archive: IMockReference, ds: IMockDataSet): IArchiveRef {
        const actual = ds.archives.find((a) => a.id === archive.id)!;
        if (!actual) { this.logMockNotFound(archive.id, "archives"); }
        const parent = this.cleanGroupRef(actual.parent, ds);

        return {
            kind: "archive",
            parent,
            ref: true,

            id: actual.id,
            name: actual.name,

            title: actual.title,
            teaser: actual.teaser,
        };
    }

    private cleanDocumentParentRef(ref: IMockReference, ds: IMockDataSet): IDocumentParentRef {

        // if we can find a document reference, return a document
        const docRef = ds.documents.find((d) => d.id === ref.id);
        if (typeof docRef !== "undefined") {
            return this.cleanDocumentRef(ref, ds);

        // else try and find an archive reference
        } else {
            return this.cleanArchiveRef(ref, ds);
        }
    }

    private cleanDocumentRef(document: IMockReference, ds: IMockDataSet): IDocumentRef {
        const actual = ds.documents.find((d) => d.id === document.id)!;
        if (!actual) { this.logMockNotFound(document.id, "documents"); }
        const parent = this.cleanDocumentParentRef(actual.parent, ds);

        return {
            kind: "document",
            parent,
            ref: true,

            name: actual.name,
            id: actual.id,
        };
    }

    private cleanOpaqueElementRef(opaque: IMockReference, ds: IMockDataSet): IOpaqueElementRef {
        const actual = ds.opaques.find((o) => o.id === opaque.id)!;
        if (!actual) { this.logMockNotFound(opaque.id, "opaques"); }
        const parent = this.cleanDocumentRef(actual.parent, ds);

        return {
            kind: "opaque",
            parent,
            ref: true,

            name: actual.name,
            id: actual.id,
        };
    }

    private cleanTheoryRef(theory: IMockReference, ds: IMockDataSet): ITheoryRef {
        const actual = ds.modules.find((t) => t.id === theory.id && t.kind === "theory")! as ITheory;
        if (!actual) { this.logMockNotFound(theory.id, "modules (as theory)"); }

        return {
            kind: "theory",
            parent: null,
            ref: true,

            name: actual.name,
            id: actual.id,
        };
    }

    private cleanViewRef(view: IMockReference, ds: IMockDataSet): IViewRef {
        const actual = ds.modules.find((v) => v.id === view.id && v.kind === "view")! as IView;
        if (!actual) { this.logMockNotFound(view.id, "modules (as view)"); }

        return {
            kind: "view",
            parent: null,
            ref: true,

            name: actual.name,
            id: actual.id,
        };
    }

    private cleanGroup(group: IMockReference, ds: IMockDataSet): IGroup {
        const ref = this.cleanGroupRef(group, ds);
        const actual = ds.groups.find((g) => g.id === group.id)!;

        const archives = ds.archives
            .filter((a) => a.parent.id === group.id)
            .map((a) => this.cleanArchiveRef(a, ds));

        return {
            ...ref,
            ref: false,

            description: actual.description,
            responsible: actual.responsible,
            archives,
            statistics: actual.statistics,
        };
    }

    private cleanTag(tag: IMockReference, ds: IMockDataSet): ITag {
        // tslint:disable-next-line:no-console
        console.log("trying to clean", tag);
        const ref = this.cleanTagRef(tag, ds);
        const archives =  ds.archives
            .filter((a) => a.tags.indexOf(ref.name) !== -1)
            .map((a) => this.cleanArchiveRef(a, ds));

        return {
            ...ref,
            ref: false,

            archives,
        };
    }

    private findNarrativeChildren(
        parent: IMockReference,
        moduleChildren: IMockReference[],
        ds: IMockDataSet,
    ): INarrativeElement[] {
        // TODO: This does not maintain order
        // and also does not properly send mock children

        const opaques = ds.opaques
            .filter((o) => o.parent.id === parent.id)
            .map((o) => this.cleanOpaqueElement(o, ds));

        const documents = ds.documents
            .filter((d) => d.parent.id === parent.id)
            .map((d) => this.cleanDocument(d, ds));

        const modules = moduleChildren
            .map((m) => ds.modules.find((dm) => dm.id === m.id))
            .filter((m) => typeof m !== "undefined")
            .map((m) => m!.kind === "theory" ? this.cleanTheoryRef(m!, ds) : this.cleanViewRef(m!, ds));

        return ([] as INarrativeElement[])
            .concat(opaques, documents, modules);
    }

    private cleanArchive(archive: IMockReference, ds: IMockDataSet): IArchive {
        const ref = this.cleanArchiveRef(archive, ds);
        const actual = ds.archives.find((a) => a.id === archive.id)!;

        const children = this.findNarrativeChildren(archive, actual.modules, ds);
        let narrativeRoot: IDocument;

        // if we have more than one child, try the first valid one or fail
        if (children.length !== 1) {
            // tslint:disable-next-line:no-console
            console.warn(`Mock Dataset: Expected exactly one child of ${archive.id}, found ${children.length}`);

            // tslint:disable-next-line:no-object-literal-type-assertion
            narrativeRoot = (children.find((c: INarrativeElement) => c.kind === "document") || {}) as IDocument;

        // tslint:disable-next-line:no-console
            console.warn(`Mock Dataset: child is of kind ${narrativeRoot.kind}`);
         } else {
            narrativeRoot = children[0] as IDocument;
        }

        const tags = actual.tags.map((ts) => this.cleanTagRef({id: "@" + ts}, ds));

        return {
            ...ref,
            ref: false,

            tags,
            description: actual.description,
            responsible: actual.responsible,
            narrativeRoot,
            statistics: actual.statistics,
        };
    }

    private cleanDocument(document: IMockReference, ds: IMockDataSet): IDocument {
        const ref = this.cleanDocumentRef(document, ds);
        const actual = ds.documents.find((d) => d.id === document.id)!;

        const decls = this.findNarrativeChildren(document, actual.modules, ds);

        return {
            ...ref,
            ref: false,

            decls,
            statistics: actual.statistics,
        };
    }

    private cleanOpaqueElement(opaque: IMockReference, ds: IMockDataSet): IOpaqueElement {
        const ref = this.cleanOpaqueElementRef(opaque, ds);
        const actual = ds.opaques.find((o) => o.id === opaque.id)!;
        // const parent = this.cleanNarrativeParentRef(actual.parent, ds);

        return {
            ...ref,
            ref: false,

            content: actual.content,
            contentFormat: actual.contentFormat,
        };
    }

    private cleanTheory(theory: IMockReference, ds: IMockDataSet): ITheory {
        const ref = this.cleanTheoryRef(theory, ds);
        const actual = ds.modules.find((t) => t.id === theory.id && t.kind === "theory")! as ITheory;

        const meta = actual.meta ? this.cleanTheoryRef(actual.meta!, ds) : undefined;

        return {
            ...ref,
            ref: false,

            presentation: actual.presentation,
            source: actual.source,

            meta,
        };
    }

    private cleanView(view: IMockReference, ds: IMockDataSet): IView {
        const ref = this.cleanViewRef(view, ds);
        const actual = ds.modules.find((v) => v.id === view.id && v.kind === "view")! as IView;

        const domain = this.cleanTheoryRef(actual.domain, ds);
        const codomain = this.cleanTheoryRef(actual.codomain, ds);

        return {
            ...ref,
            ref: false,

            presentation: actual.presentation,
            source: actual.source,

            domain,
            codomain,
        };
    }

    // #endregion

    // #region "Getters"

    /** retrieves all groups from the dataset */
    public getGroups(): Promise<IGroupRef[]> {
        return this.loadDataSet().then((ds) => ds.groups.map((o) => this.cleanGroupRef(o, ds)));
    }

    /** given a URI, returns an object */
    public getURI(uri: URI): Promise<IReferencable> {
        let kind: string = "";

        return this.getObjectOfType(
            (ds: IMockDataSet) => {
                const groups = ds.groups.find((g) => g.id === uri);
                if (groups) {
                    kind = "group";
                    return groups;
                }

                const archives = ds.archives.find((a) => a.id === uri);
                if (archives) {
                    kind = "archive";
                    return archives;
                }

                const documents = ds.documents.find((d) => d.id === uri);
                if (documents) {
                    kind = "document";
                    return documents;
                }

                const opaques = ds.opaques.find((o) => o.id === uri);
                if (opaques) {
                    kind = "opaque";
                    return opaques;
                }

                const modules = ds.modules.find((m) => m.id === uri);
                if (modules) {
                    kind = "modules";
                    return modules;
                }

                return undefined;
            },
            (d: IMockObject) => kind,
            `No Document or Module with ${uri} exists. `,
        );
    }

    /** gets a group from the mock dataset */
    public getGroup(id: string): Promise<IGroup> {
        return this.getObjectOfType(
            (ds: IMockDataSet) => ds.groups.find((g) => g.id === id),
            (d: IMockObject) => "group",
            `Group ${id} does not exist. `,
        );
    }

    /** gets a group from the mock dataset */
    public getTag(id: string): Promise<ITag> {
        const theMockTag = id.startsWith("@") ?
            {id, name: id.substring(1)} : undefined;
        return this.getObjectOfType(
            (ds: IMockDataSet) => theMockTag,
            (d: IMockObject) => "tag",
            `Group ${id} does not exist. `,
        );
    }

    /** gets an archive from the mock dataset */
    public getArchive(id: string): Promise<IArchive> {
        return this.getObjectOfType(
            (ds: IMockDataSet) => ds.archives.find((a) => a.id === id),
            (d: IMockObject) => "archive",
            `Archive ${id} does not exist. `,
        );
    }

    /** gets a document from the mock dataset */
    public getDocument(id: string): Promise<IDocument> {
        return this.getObjectOfType(
            (ds: IMockDataSet) => ds.documents.find((d) => d.id === id),
            (d: IMockObject) => "document",
            `Document ${id} does not exist. `,
        );
    }

    /** gets a module from the mock dataset */
    public getModule(id: string): Promise<IModule> {
        return this.getObjectOfType(
            (ds: IMockDataSet) => ds.modules.find((m) => m.id === id),
            (d: IMockObject) => (d as IMockModule).kind,
            `Module ${id} does not exist. `,
        );
    }

    // #endregion
}

export class MockClient extends LazyMockClient {
    constructor() {
        super(async () => {
            const mock = await import("../../../../assets/mock.json");
            return mock.default as IMockDataSet; // TODO: Fix the errors here
        });
    }
}