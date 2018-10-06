import { IStorageService } from './IStorageService';
import { IExtension } from '../models/extension';
import fs from 'fs';
import { promisify } from 'util';
export default class StorageService implements IStorageService {
    public async saveFile(buffer: Buffer, path: string) {
        await promisify(fs.writeFile)(path, buffer);
    }
    
    public getPath(extension: IExtension) {
        return extension.id;
    }
}
