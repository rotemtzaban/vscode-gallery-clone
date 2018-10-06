import { IExtension } from '../models/extension';
import { IQuery } from '../models/query';
import { IRawGalleryQueryResults } from '../models/extension-types';
import { IDalService } from './IDalService';

export default class DalService implements IDalService {
    public async indexDocument(extension: IExtension, path: string) {
        return;
    }

    public async queryExtensions(query: IQuery) {
        return (undefined as any) as IRawGalleryQueryResults;
    }
}
