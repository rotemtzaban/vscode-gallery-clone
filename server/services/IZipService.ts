import jszip from 'jszip';
import { IExtension } from '../models/extension';
import { convertXml } from './xmlConverter';
export interface IZipService {
    extractData(data: Buffer): Promise<IExtension>;
    getFile(data: Buffer | NodeJS.ReadableStream, fileName: string): Promise<Buffer>;
}

export class ZipService implements IZipService {
    public async extractData(data: Buffer) {
        const zip = await jszip.loadAsync(data);
        const text = await zip.file('extension.vsixmanifest').async('text');
        const result = await convertXml(text);
        return result;
    }

    public async getFile(
        data: Buffer | NodeJS.ReadableStream,
        fileName: string
    ): Promise<Buffer> {
        const zip = await jszip.loadAsync(data);
        return Buffer.from(await zip.file(fileName).async('arraybuffer'));
    }
}
