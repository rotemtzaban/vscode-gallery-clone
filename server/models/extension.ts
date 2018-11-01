import { } from './extension-types';

export type IExtension = IExtensionInfo & IExtensionVersionInfo;

export interface IDbExtension extends IExtensionInfo {
    versions: IExtensionVersionInfo[];
}

export interface IExtensionInfo {
    packageId: string;
    publisher: string;
    displayName: string;
    description: string;
    categories: string[];
    galleryFlags: string[];
    tags: string[];
}

export interface IExtensionVersionInfo {
    version: string;
    properties: Array<{ key: string; value: string }>;
    assets: IAsset[];
}

export interface IAsset {
    type: string;
    path: string;
}
