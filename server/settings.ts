import config from 'config';

export interface ISettings {
    database: {
        connectionString: string;
        databaseName: string;
        collectionName: string;
    };
    storage: {
        location: string;
    };
}
const { util, get, has, ...settings } = config;

export default settings as ISettings;
