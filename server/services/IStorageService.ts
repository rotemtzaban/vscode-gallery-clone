import { IExtension } from '../models/extension';

export interface IStorageService {
    saveFile(buffer: Buffer, path: string): Promise<void>;
    getPath(extension: IExtension): string;
}
