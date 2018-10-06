import { parseString, OptionsV2 } from 'xml2js';
export async function parseXmlAsync(text: string, options: OptionsV2) {
    return new Promise<unknown>((resolve, reject) => {
        parseString(text, options, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

