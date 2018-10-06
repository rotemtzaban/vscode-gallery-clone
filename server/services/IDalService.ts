import { IExtension } from "../models/extension";
import { IRawGalleryQueryResults } from "../models/extension-types";
import { IQuery } from "../models/query";

export interface IDalService {
    indexDocument (extension: IExtension, path: string):Promise<void>;
    queryExtensions(query: IQuery):Promise<IRawGalleryQueryResults>;
}