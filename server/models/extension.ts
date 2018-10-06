import {} from './extension-types';

export type IExtension = IExtensionInfo & IExtensionVersionInfo;

export interface IExtensionInfo {
    id: string;
    publisher: string;
    version: string;
    displayName: string;
    description: string;
}

export interface IExtensionVersionInfo {
    tags: string[];
    categories: string[];
    galleryFlags: string[];
    properties: Array<{ key: string; value: string }>;
    assets: IAsset[];
}

export interface IAsset {
    type: string;
    path: string;
}
