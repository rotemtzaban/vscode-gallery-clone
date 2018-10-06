export interface IQuery {
    filters:IFilters[];
    assetTypes:string[];
    flags:Flags;
}

interface IFilters {
    criteria:ICriterium[]
    pageNumber:number;
    pageSize:number;
    sortBy:SortBy;
    sortOrder:SortOrder;
}

enum SortBy {
	NoneOrRelevance = 0,
	LastUpdatedDate = 1,
	Title = 2,
	PublisherName = 3,
	InstallCount = 4,
	PublishedDate = 5,
	AverageRating = 6,
	WeightedRating = 12
}

enum SortOrder {
	Default = 0,
	Ascending = 1,
	Descending = 2
}

interface ICriterium {
	filterType: FilterType;
	value?: string;
}

enum FilterType {
	Tag = 1,
	ExtensionId = 4,
	Category = 5,
	ExtensionName = 7,
	Target = 8,
	Featured = 9,
	SearchText = 10,
	ExcludeWithFlags = 12
}

enum Flags {
	None = 0x0,
	IncludeVersions = 0x1,
	IncludeFiles = 0x2,
	IncludeCategoryAndTags = 0x4,
	IncludeSharedAccounts = 0x8,
	IncludeVersionProperties = 0x10,
	ExcludeNonValidated = 0x20,
	IncludeInstallationTargets = 0x40,
	IncludeAssetUri = 0x80,
	IncludeStatistics = 0x100,
	IncludeLatestVersionOnly = 0x200,
	Unpublished = 0x1000
}