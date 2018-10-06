import { parseXmlAsync } from '../utils';
import { IExtension } from '../models/extension';
import { processors } from 'xml2js';

export async function convertXml(extensionXml: string): Promise<IExtension> {
    const rawData = (await parseXmlAsync(extensionXml, {
        attrNameProcessors: [processors.firstCharLowerCase],
        attrValueProcessors: [processors.parseBooleans],
        tagNameProcessors: [processors.firstCharLowerCase],
        valueProcessors: [processors.parseBooleans],
        emptyTag: null,
        explicitCharkey: true,
        charkey: '_',
        attrkey: '$'
    })) as ExtensionXmlData;
    const packageManifest = rawData.packageManifest;
    const metadata = packageManifest.metadata[0];
    const { language: _language, ...identity } = metadata.identity[0].$;
    const displayName = metadata.displayName[0]._;
    const description = metadata.description[0]._;
    const tags = parseRawArray(metadata.tags);
    const categories = parseRawArray(metadata.categories);
    const galleryFlags = parseRawArray(metadata.galleryFlags);
    const properties = metadata.properties[0].property.map(prop => {
        return { key: prop.$.id, value: prop.$.value };
    });

    const assets = packageManifest.assets[0].asset.map(rawAsset => {
        const { addressable, ...asset } = rawAsset.$;
        return asset;
    });

    return {
        assets,
        categories,
        tags,
        displayName,
        description,
        properties,
        galleryFlags,
        ...identity
    };
}

const parseRawArray = (rawText: Text) => {
    const text = rawText[0]._;
    return text ? text.split(',') : [];
};

interface PackageManifest {
    metadata: [ExtensionMetadata];
    installation: ExtensionInstallation[];
    dependencies: never[];
    assets: [ExtensionAssets];
}

interface ExtensionXmlData {
    packageManifest: PackageManifest;
}

interface ExtensionAssets {
    asset: Attrs<ExtensionAsset>;
}

interface ExtensionAsset {
    type: string;
    path: string;
    addressable: boolean;
}

interface ExtensionMetadata {
    identity: Attrs<ExtensionIdentity>;
    displayName: Text;
    description: Text;
    tags: Text;
    categories: Text;
    galleryFlags: Text;
    badges: { badge: Attrs<ExtensionBadge> };
    properties: [{ property: Attrs<ExtensionProperty> }];
    license: Text;
    icon: string;
}

interface ExtensionInstallation {
    installationTarget: Attrs<{ id: string }>;
}

interface ExtensionBadge {
    link: string;
    imgUri: string;
    description: string;
}

interface ExtensionProperty {
    id: string;
    value: string;
}

interface ExtensionIdentity {
    language: string;
    id: string;
    version: string;
    publisher: string;
}

export type Attrs<T> = Array<{ $: T }>;
export type Text = [{ _: string }];
