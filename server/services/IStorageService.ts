export interface IStorageService {
    saveFile(buffer: Buffer, path: string): Promise<void>;
    getPath(publisher: string, name: string, version: string): string;
    getFileStream(path: string): NodeJS.ReadableStream;
    getFileBuffer(path: string): Promise<Buffer>;
}
