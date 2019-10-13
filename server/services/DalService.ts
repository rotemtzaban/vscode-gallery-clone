import {
    IExtension,
    IDbExtension,
    IExtensionInfo,
    IExtensionVersionInfo
} from '../models/extension';
import { IQuery, FilterType, SortBy, SortOrder, Flags } from '../models/query';
import _ from 'lodash';
import { IDalService } from './IDalService';

import mongodb, { FilterQuery, MongoClient, UpdateQuery, ObjectID } from 'mongodb';
import { ISettings } from '../settings';
export default class DalService implements IDalService {
    constructor(private readonly collection: mongodb.Collection<IDbExtension>) {}

    public async storeExtension(extension: IExtension) {
        const extensionInfo: IExtensionInfo = {
            name: extension.name,
            publisher: extension.publisher,
            description: extension.description,
            categories: extension.categories,
            galleryFlags: extension.galleryFlags,
            tags: extension.tags,
            displayName: extension.displayName
        };

        const { tags, categories, ...upsert } = extensionInfo;

        const versionInfo: IExtensionVersionInfo = {
            version: extension.version,
            assets: extension.assets,
            properties: extension.properties
        };

        const update: UpdateQuery<IDbExtension> = {
            $setOnInsert: { ...upsert },
            $push: {
                versions: { $each: [versionInfo], $sort: { version: -1 } }
            },
            $addToSet: {
                tags: { $each: extensionInfo.tags },
                categories: { $each: extensionInfo.categories }
            }
        };
        await this.collection.updateOne(
            { name: extension.name, publisher: extension.publisher },
            update,
            { upsert: true }
        );
    }

    public async queryExtensions(
        query: IQuery
    ): Promise<{ totalCount: number; results: IDbExtension[] }> {
        const sort = this.getSort(query);
        const filter: FilterQuery<IDbExtension> = this.getFilter(query);
        const projection = this.getProjection(query);
        const count = await this.collection.find(filter).count();
        const pageSize = query.filters[0].pageSize;
        const pageNumber = query.filters[0].pageNumber || 1;
        const limit = pageSize && pageSize < 200 && pageSize > 0 ? pageSize : 50;
        const skip = limit * (pageNumber - 1);

        const results = await this.collection
            .find(filter)
            .sort(sort)
            .project(projection)
            .limit(limit)
            .skip(skip)
            .toArray();
        return { results, totalCount: count };
    }

    private getSort(query: IQuery) {
        const filter = query.filters[0];
        const sortOrder = filter.sortOrder === SortOrder.Descending ? -1 : 1;
        switch (filter.sortBy) {
            case SortBy.Title: {
                return { displayName: sortOrder };
            }
            default: {
                if (filter.criteria.some(c => c.filterType === FilterType.SearchText)) {
                    return { score: { $meta: 'textScore' } };
                } else {
                    return {};
                }
            }
        }
    }

    private getProjection(query: IQuery) {
        const filter = query.filters[0];
        const hasSearchText = filter.criteria.some(
            c => c.filterType === FilterType.SearchText
        );
        const scoreProjection = hasSearchText ? { score: { $meta: 'textScore' } } : {};
        const flags = query.flags;

        // tslint:disable:no-bitwise
        const includeVersion = Boolean(
            flags &
                (Flags.IncludeLatestVersionOnly |
                    Flags.IncludeVersionProperties |
                    Flags.IncludeVersions |
                    Flags.IncludeFiles)
        );

        const includeLatestVersionOnly = Boolean(flags & Flags.IncludeLatestVersionOnly);
        const versionProjection = includeVersion
            ? includeLatestVersionOnly
                ? { versions: { $slice: 1 } }
                : {}
            : { versions: 0 };

        const includeFiles = Boolean(flags & Flags.IncludeFiles);
        const filesProjection = includeFiles ? {} : { 'versions.assets': 0 };
        const includeProperties = Boolean(flags & Flags.IncludeVersionProperties);
        const propertiesProjection = includeProperties ? {} : { 'versions.properties': 0 };

        const includeCategoriesAndTags = Boolean(flags & Flags.IncludeCategoryAndTags);
        const categoriesProjection = includeCategoriesAndTags
            ? {}
            : { categories: 0, tags: 0 };
        // tslint:enable:no-bitwise

        return {
            ...scoreProjection,
            ...versionProjection,
            ...filesProjection,
            ...categoriesProjection,
            ...propertiesProjection
        };
    }

    private getFilter(query: IQuery): mongodb.FilterQuery<IDbExtension> {
        const criteria = query.filters[0].criteria;

        const tags = criteria
            .filter(criterium => criterium.filterType === FilterType.Tag)
            .map(c => c.value);

        // Makes some assumptions. like no query has both id and name, and id and name are the same thing.
        // Those assumptions are true for current use case
        // maybe should be separate??.
        const ids = criteria
            .filter(
                criterium =>
                    criterium.filterType === FilterType.ExtensionId
            )
            .map(c => c.value).map(value => new ObjectID(value));

        const names = criteria
            .filter(criterium => criterium.filterType === FilterType.ExtensionName)
            .map(c => c.value.split('.')[1])
            .filter(c => c);

        // const _targets = criteria
        //     .filter(criterium => criterium.filterType === FilterType.Target)
        //     .map(c => c.value);

        const categories = criteria
            .filter(criterium => criterium.filterType === FilterType.Category)
            .map(c => c.value);

        const searchText = criteria
            .filter(criterium => criterium.filterType === FilterType.SearchText)
            .map(c => c.value)[0];

        const idsFilter: FilterQuery<IDbExtension> =
            ids.length > 0
                ? {
                      _id: { $in: ids }
                  }
                : {};

        const namesFilter: FilterQuery<IDbExtension> =
            names.length > 0
                ? {
                      name: { $in: names }
                  }
                : {};

        const tagsFilter: FilterQuery<IDbExtension> =
            tags.length > 0
                ? {
                      tags: { $in: tags }
                  }
                : {};

        const categoriesFilter: FilterQuery<IDbExtension> =
            categories.length > 0
                ? {
                      categories: { $in: categories }
                  }
                : {};

        const targetFilter = {}; // TODO: make this work!

        const searchTextFilter: FilterQuery<IDbExtension> = searchText
            ? { $text: { $search: searchText } }
            : {};

        return {
            ...idsFilter,
            ...namesFilter,
            ...tagsFilter,
            ...categoriesFilter,
            ...targetFilter,
            ...searchTextFilter
        };
    }

    public async getExtensionVersion(name: string, publisher: string, version: string) {
        const extensions = await this.collection
            .find({ name, publisher, 'versions.version': version })
            .limit(1)
            .toArray();

        if (!extensions || !extensions[0]) {
            return null;
        }

        return extensions[0].versions.find(ver => ver.version === version) || null;
    }

    public async exists(name: string, publisher: string, version: string) {
        const extensions = await this.collection
            .find({ name, publisher, 'versions.version': version })
            .limit(1)
            .toArray();

        return extensions.length > 0;
    }

    public static async create(settings: ISettings): Promise<IDalService> {
        const client = await MongoClient.connect(settings.database.connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            reconnectTries: Infinity,
            bufferMaxEntries: 0
        });

        const db = client.db(settings.database.databaseName);

        const collection = await db.createCollection<IDbExtension>(
            settings.database.collectionName,
            { collation: { strength: 2, locale: 'en' } }
        );
        const text: IndexType<IDbExtension> = {
            description: 'text',
            displayName: 'text',
            name: 'text',
            publisher: 'text',
            'versions.tags': 'text',
            'versions.categories': 'text'
        };

        collection.createIndex(text, { name: 'fullText', collation: { locale: 'simple' } });

        const packageIndex: IndexType<IDbExtension> = {
            name: 1,
            publisher: 1
        };

        collection.createIndex(packageIndex, { unique: true });
        return new DalService(collection);
    }
}

type IndexType<T> = { [P in keyof T]: 'text' | -1 | 1 } | { [key: string]: 'text' | -1 | 1 };
