import { Context } from 'koa';
import { PackageDetails } from '../models/PackageDetails';
import { IQuery } from '../models/query';
import { MulterIncomingMessage } from 'koa-multer';
import { IDalService } from '../services/IDalService';
import { IStorageService } from '../services/IStorageService';
import { IZipService } from '../services/IZipService';
import { IExtension, IDbExtension } from '../models/extension';
import {
    IRawGalleryExtension,
    IRawGalleryExtensionVersion,
    IRawGalleryQueryResults,
    AssetType
} from '../models/extension-types';

export default class ApiController {
    constructor(
        private readonly dal: IDalService,
        private readonly storage: IStorageService,
        private readonly zip: IZipService
    ) {}
    public readonly reportStatistic = async (ctx: Context) => {
        const statType = ctx.query.statType;
        const params = ctx.params;
        ctx.body = { ...params, statType, host: ctx.host };
    };

    public downloadAsset = async (ctx: Context): Promise<any> => {
        const params: PackageDetails & { asset: string } = ctx.params;
        const path = this.storage.getPath(params.publisher, params.name, params.version);
        if(params.asset === AssetType.VSIX){
            return this.downloadPackage(ctx);
        }
        const extension = await this.dal.getExtensionVersion(
            params.name,
            params.publisher,
            params.version
        );
        if (extension) {
            const requestedAsset = extension.assets.find(asset => asset.type === params.asset);
            if (requestedAsset) {
                const assetFile = decodeURIComponent(requestedAsset.path);
                ctx.body = await this.zip.getFile(
                    await this.storage.getFileBuffer(path),
                    assetFile
                );
            } else {
                ctx.status = 404;
                ctx.body = 'requsted asset does not exist';
            }
        } else {
            ctx.status = 404;
            ctx.body = 'requsted package does not exist';
        }
    };

    public readonly downloadPackage = async (ctx: Context) => {
        const params: PackageDetails = ctx.params;
        const path = this.storage.getPath(params.publisher, params.name, params.version);
        const stream = this.storage.getFileStream(path);
        ctx.body = stream;
    };

    public readonly query = async (ctx: Context) => {
        const query = ctx.request.body as IQuery;
        const queryResult = await this.dal.queryExtensions(query);
        const res = convertExtensionsToRawFormat(queryResult, ctx, query);
        ctx.body = res;
    };

    public readonly upload = async (ctx: Context) => {
        const req = ctx.req as MulterIncomingMessage;

        const file = req.file; // const files = req.files ??
        const extensionData = await this.zip.extractData(file.buffer);
        if (await this.extensionExists(extensionData)) {
            ctx.body = 'extension already exists';
            return;
        }

        const path = this.storage.getPath(
            extensionData.publisher,
            extensionData.packageId,
            extensionData.version
        );

        // Important: first store to filesystem and then to db, so extension in db will surely exist
        await this.storage.saveFile(file.buffer, path);
        await this.dal.storeExtension(extensionData);
        ctx.body = extensionData;
    };

    private async extensionExists(extension: IExtension) {
        const exists = await this.dal.exists(
            extension.packageId,
            extension.publisher,
            extension.version
        );

        return exists;
    }
}
function convertExtensionsToRawFormat(
    queryResult: {
        totalCount: number;
        results: IDbExtension[];
    },
    ctx: Context,
    query: IQuery
): IRawGalleryQueryResults {
    return {
        results: [
            {
                resultMetadata: [
                    {
                        metadataType: 'ResultCount',
                        metadataItems: [
                            {
                                name: 'TotalCount',
                                count: queryResult.totalCount
                            }
                        ]
                    }
                ],
                extensions: queryResult.results.map(ext => {
                    const extension: IRawGalleryExtension = {
                        displayName: ext.displayName,
                        extensionId: ext.packageId,
                        extensionName: ext.packageId,
                        flags: ext.galleryFlags.join(', '),
                        publisher: {
                            displayName: ext.publisher,
                            publisherId: ext.publisher,
                            publisherName: ext.publisher
                        },
                        shortDescription: ext.description,
                        statistics: [],
                        versions: ext.versions.map(ver => {
                            const assetUrl = `${ctx.URL.origin}/api/publishers/${
                                ext.publisher
                            }/vsextensions/${ext.packageId}/${ver.version}/vspackage`;
                            const version: IRawGalleryExtensionVersion = {
                                version: ver.version,
                                properties: ver.properties,
                                files: ver.assets
                                    .map(asset => {
                                        return {
                                            assetType: asset.type,
                                            source: `${assetUrl}/${asset.type}`
                                        };
                                    })
                                    .concat({
                                        source: assetUrl,
                                        assetType: AssetType.VSIX
                                    })
                                    .filter(file => {
                                        if (query.assetTypes && query.assetTypes.length > 0) {
                                            return query.assetTypes.includes(file.assetType);
                                        }
                                        return true;
                                    }),
                                assetUri: assetUrl,
                                fallbackAssetUri: assetUrl
                            };
                            return version;
                        })
                    };
                    return extension;
                })
            }
        ]
    };
}
