export interface CatalogOffer {
    id: string;
    title: string;
    description: string;
    longDescription: string;
    keyImages: KeyImage[];
    categories: Category[];
    namespace: Namespace;
    status: Status;
    creationDate: string;
    lastModifiedDate: string;
    internalName: string;
    recurrence: Recurrence;
    items: Item[];
    currencyCode: CurrencyCode;
    currentPrice: number;
    price: number;
    basePrice: number;
    basePriceCurrencyCode: BasePriceCurrencyCode;
    recurringPrice: number;
    freeDays: number;
    maxBillingCycles: number;
    seller: Seller;
    viewableDate: string;
    effectiveDate: string;
    expiryDate?: string;
    vatIncluded: boolean;
    isCodeRedemptionOnly: boolean;
    isFeatured: boolean;
    taxSkuId: TaxSkuID;
    merchantGroup: MerchantGroup;
    priceTier: string;
    urlSlug: string;
    roleNamesToGrant: string[];
    purchaseLimit: number;
    ignoreOrder: boolean;
    fulfillToGroup: boolean;
    fraudItemType: string;
    shareRevenue: boolean;
    offerType?: OfferType;
    unsearchable: boolean;
    releaseOffer?: string;
    title4Sort: string;
    refundType: RefundType;
    visibilityType?: VisibilityType;
    currencyDecimals: number;
    allowPurchaseForPartialOwned: boolean;
    shareRevenueWithUnderageAffiliates: boolean;
    partialItemPrerequisiteCheck: boolean;
    technicalDetails?: string;
    customAttributes?: { [key: string]: CustomAttribute };
    tags?: number[];
    selfRefundable?: boolean;
    releaseDate?: string;
    pcReleaseDate?: string;
    publisherDisplayName?: string;
    developerDisplayName?: string;
    platformWhitelist?: any[];
    platformBlacklist?: string[];
    numOfCodes?: number;
    alias?: string;
}

export type BasePriceCurrencyCode = "USD"

export interface Category {
    path: string;
}

export type CurrencyCode = "USD" | "CAD"

export interface CustomAttribute {
    type: string;
    value: string;
}

export enum Type {
    String = "STRING",
}


export interface Item {
    id: string;
    keyImages: any[];
    categories: any[];
    namespace: Namespace;
    unsearchable: boolean;
}

export type Namespace = "fn";

export interface KeyImage {
    type: string;
    url: string;
    md5: string;
    width: number;
    height: number;
    size: number;
    uploadedDate: string;
}

export type MerchantGroup = "FN_MKT"

export type OfferType =
    "ADD_ON" |
    "IN_GAME_PURCHASE" |
    "OTHERS"


export type Recurrence = "ONCE"

export type RefundType = "NON_REFUNDABLE"

export interface Seller {
    id: string;
    name: string;
}

export type Status = "ACTIVE";

export type TaxSkuID = "FN_Currency"

export type VisibilityType = "IS_LISTED"