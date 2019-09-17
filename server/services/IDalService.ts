import { IExtension, IDbExtension, IExtensionVersionInfo } from '../models/extension';
import { IQuery } from '../models/query';

export interface IDalService {
    storeExtension(extension: IExtension): Promise<void>;
    queryExtensions(query: IQuery): Promise<{totalCount:number, results:IDbExtension[]}>;
    getExtensionVersion(
        id: string,
        publisher: string,
        version: string
    ): Promise<IExtensionVersionInfo | null>;
    exists(
        id: string,
        publisher: string,
        version: string
    ): Promise<boolean>;
}
