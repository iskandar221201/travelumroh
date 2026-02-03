export interface SearchDataItem {
    title: string;
    description: string;
    url: string;
    category: string;
    keywords: string[];
    price_numeric?: number;
    is_recommended?: boolean;
    image_url?: string;
    answer?: string;
}

export interface SearchResult {
    results: SearchDataItem[];
    intent: string;
    entities: {
        isLocation: boolean;
        isVIP: boolean;
        isReguler: boolean;
        isLegalitas: boolean;
        isContact: boolean;
    };
    confidence: number;
}
