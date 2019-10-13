import { IStorageService } from './IStorageService';
import fs from 'fs';
import { promisify } from 'util';
import { ISettings } from '../settings';
import path from 'path';
import mkdirp from 'mkdirp-promise';
export default class StorageService implements IStorageService {
    public getFileBuffer(filePath: string): Promise<Buffer> {
        return promisify(fs.readFile)(filePath);
    }
    public getFileStream(filePath: string): NodeJS.ReadableStream {
        return fs.createReadStream(filePath);
    }
    constructor(private readonly settings: ISettings) {}

    public async saveFile(buffer: Buffer, filePath: string) {
        await mkdirp(path.dirname(filePath));
        await promisify(fs.writeFile)(filePath, buffer);
    }

    public getPath(publisher: string, name: string, version: string) {
        return path.resolve(
            this.settings.storage.location,
            name,
            `${publisher}.${name}-${version}.vsix`
        );
    }
}
