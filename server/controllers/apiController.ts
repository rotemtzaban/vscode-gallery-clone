import { Context } from 'koa';
import { PackageDetails } from '../models/PackageDetails';
import { IQuery } from '../models/query';
import { MulterIncomingMessage } from 'koa-multer';
import { IDalService } from '../services/IDalService';
import { IStorageService } from '../services/IStorageService';
import { IZipService } from '../services/IZipService';

export default class ApiController {
    /**
     *
     */
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

    public readonly downloadPackage = async (ctx: Context) => {
        const params: PackageDetails = ctx.params;
        ctx.body = params;
    };

    public readonly query = async (ctx: Context) => {
        const reqBody = ctx.request.body as IQuery;
        const response = await this.dal.queryExtensions(reqBody);
        ctx.body = response;
    };

    public readonly upload = async (ctx: Context) => {
        const req = ctx.req as MulterIncomingMessage;

        const file = req.file; // const files = req.files ??
        const extensionData = await this.zip.extractData(file.buffer);
        ctx.body = extensionData;
        // const path = this.storage.getPath(extensionData);
        // await this.storage.saveFile(file.buffer, path);

        // await this.dal.indexDocument(extensionData, path);
    };
}
