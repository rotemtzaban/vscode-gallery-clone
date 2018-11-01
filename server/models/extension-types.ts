export interface IRawGalleryQueryResults {
    results: [IRawGalleryQueryResult];
}

interface IRawGalleryQueryResult {
    extensions: IRawGalleryExtension[];
    resultMetadata: IQueryMetadata[];
}

interface IQueryMetadata {
    metadataType: string;
    metadataItems: IMeteadataItem[];
}

interface IMeteadataItem {
    name: string;
    count: number;
}

export interface IRawGalleryExtension {
    extensionId: string;
    extensionName: string;
    displayName: string;
    shortDescription: string;
    publisher: {
        displayName: string;
        publisherId: string;
        publisherName: string;
    };
    flags: string;
    versions: IRawGalleryExtensionVersion[];
    statistics: IRawGalleryExtensionStatistics[];
}

export interface IRawGalleryExtensionVersion {
    version: string;
    lastUpdated?: string;
    assetUri: string;
    fallbackAssetUri: string;
    files: IRawGalleryExtensionFile[];
    properties?: IRawGalleryExtensionProperty[];
}

interface IRawGalleryExtensionStatistics {
    statisticName: string;
    value: number;
}

interface IRawGalleryExtensionFile {
    assetType: string;
    source: string;
}

interface IRawGalleryExtensionProperty {
    key: string;
    value: string;
}

export const AssetType = {
    Changelog: 'Microsoft.VisualStudio.Services.Content.Changelog',
    Details: 'Microsoft.VisualStudio.Services.Content.Details',
    Icon: 'Microsoft.VisualStudio.Services.Icons.Default',
    License: 'Microsoft.VisualStudio.Services.Content.License',
    Manifest: 'Microsoft.VisualStudio.Code.Manifest',
    Repository: 'Microsoft.VisualStudio.Services.Links.Source',
    VSIX: 'Microsoft.VisualStudio.Services.VSIXPackage'
};

export const PropertyType = {
    Dependency: 'Microsoft.VisualStudio.Code.ExtensionDependencies',
    Engine: 'Microsoft.VisualStudio.Code.Engine',
    ExtensionPack: 'Microsoft.VisualStudio.Code.ExtensionPack'
};
