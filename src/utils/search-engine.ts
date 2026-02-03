import type { SearchDataItem, SearchResult } from "../types/search";

export class SearchEngine {
    private searchData: SearchDataItem[];
    private Fuse: any;
    // @ts-ignore
    private nlp: any;
    private fuse: any;
    private history: {
        lastCategory: string | null;
        lastIntents: string[][];
        detectedEntities: Set<string>;
    };

    private phoneticMap: Record<string, string[]> = {
        'umroh': ['omroh', 'umro', 'umrokh', 'unroh'],
        'haji': ['haji', 'haj', 'haji'],
        'syarat': ['syrat', 'sarat', 'siarat', 'persyaratan'],
        'paket': ['pakit', 'pake', 'pket'],
        'vip': ['vip', 'vif', 'fip'],
        'reguler': ['reguler', 'regerul', 'regler'],
        'manasik': ['manasik', 'nasik', 'mansik'],
        'kantor': ['kantor', 'kanter', 'kntr'],
        'alamat': ['alamat', 'lamat', 'lmmat'],
    };

    private semanticMap: Record<string, string[]> = {
        'syarat': ['dokumen', 'berkas', 'file', 'akta', 'nikah', 'kk', 'ktp'],
        'biaya': ['harga', 'tarif', 'bayar', 'duit', 'uang', 'mahal', 'murah'],
        'lokasi': ['alamat', 'kantor', 'dimana', 'maps', 'cirebon', 'mundu'],
        'layanan': ['fasilitas', 'fitur', 'sarana', 'dapat', 'apa'],
        'pendaftaran': ['daftar', 'join', 'registrasi', 'gimana'],
        'murah': ['hemat', 'ekonomis', 'promo', 'terjangkau', 'miring'],
        'eksklusif': ['mewah', 'premium', 'high-end', 'business'],
    };

    private stopWords = new Set([
        'yang', 'di', 'ke', 'dari', 'dan', 'atau', 'pada', 'dengan',
        'untuk', 'karena', 'oleh', 'itu', 'ini', 'adalah', 'bagi',
        'seperti', 'dalam', 'setelah', 'sebelum', 'siapa', 'apa',
        'mana', 'kapan', 'bagaimana', 'berapa', 'kenapa', 'mengapa',
        'mencari', 'tentang', 'info', 'informasi', 'ada', 'bisa', 'dong'
    ]);

    constructor(searchData: SearchDataItem[], Fuse: any, nlp: any) {
        this.searchData = searchData;
        this.Fuse = Fuse;
        this.nlp = nlp;

        this.history = {
            lastCategory: null,
            lastIntents: [],
            detectedEntities: new Set(),
        };

        this.fuse = Fuse ? new Fuse(searchData, {
            keys: [
                { name: "title", weight: 0.8 },
                { name: "keywords", weight: 0.5 },
                { name: "description", weight: 0.2 },
            ],
            threshold: 0.45,
            includeScore: true,
            useExtendedSearch: true,
            findAllMatches: true
        }) : null;
    }

    private autoCorrect(word: string): string {
        for (const [correct, typos] of Object.entries(this.phoneticMap)) {
            if (typos.includes(word)) return correct;
        }
        return word;
    }

    private extractEntities(words: string[]) {
        const entities = {
            isLocation: words.some(w => ['cirebon', 'mundu', 'banjarwangunan'].includes(w)),
            isVIP: words.some(w => ['vip', 'premium', 'mewah', 'eksklusif'].includes(w)),
            isReguler: words.some(w => ['reguler', 'hemat', 'murah'].includes(w)),
            isLegalitas: words.some(w => ['resmi', 'izin', 'legal', 'ppiu'].includes(w)),
            isContact: words.some(w => ['wa', 'telepon', 'kontak', 'hubungi', 'telfon'].includes(w)),
        };

        Object.keys(entities).forEach(key => {
            if ((entities as any)[key]) this.history.detectedEntities.add(key);
        });

        return entities;
    }

    private preprocess(query: string) {
        const rawWords = query.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 1);
        const correctedWords = rawWords.map(w => this.autoCorrect(w));
        const filteredWords = correctedWords.filter(w => !this.stopWords.has(w));

        const expansion: string[] = [];
        filteredWords.forEach(w => {
            if (this.semanticMap[w]) expansion.push(...this.semanticMap[w]);
        });

        return {
            original: query,
            tokens: filteredWords,
            expanded: [...new Set([...filteredWords, ...expansion])],
            entities: this.extractEntities(filteredWords)
        }
    }

    private calculateCompositeScore(item: SearchDataItem, processed: any): number {
        let score = 0;
        const text = (item.title + ' ' + (item.keywords || []).join(' ') + ' ' + item.description).toLowerCase();

        processed.tokens.forEach((token: string, i: number) => {
            if (text.includes(token)) {
                score += 10;
                if (i > 0 && text.includes(processed.tokens[i - 1] + ' ' + token)) score += 5;
            }
        });

        if (processed.tokens.length > 1) {
            const combined = processed.tokens.join(' ');
            if (item.title.toLowerCase().includes(combined)) score += 20;
        }

        if (processed.entities.isVIP && item.title.includes('VIP')) score += 15;
        if (processed.entities.isReguler && item.title.includes('Reguler')) score += 15;
        if (processed.entities.isLocation && item.category === 'Kontak') score += 15;

        if (this.history.lastCategory === item.category) score += 5;

        return score;
    }

    public search(query: string): SearchResult {
        const processed = this.preprocess(query);
        let candidates: any[] = [];

        if (this.fuse) {
            const fuseResults = this.fuse.search(processed.expanded.join(' '));
            candidates = fuseResults.map((f: any) => ({
                item: f.item,
                fuseScore: f.score
            }));
        }

        const finalResults = candidates.map(c => {
            const customScore = this.calculateCompositeScore(c.item, processed);
            const finalScore = customScore + ((1 - c.fuseScore) * 10);
            return { item: c.item, score: finalScore };
        });

        finalResults.sort((a, b) => b.score - a.score);

        if (finalResults.length > 0) {
            this.history.lastCategory = finalResults[0].item.category;
            this.history.lastIntents.push(processed.tokens);
        }

        const topMatches = finalResults
            .filter(r => r.score > 10)
            .map(r => r.item)
            .slice(0, 5);

        return {
            results: topMatches,
            intent: this.detectIntent(processed),
            entities: processed.entities,
            confidence: finalResults.length > 0 ? Math.min(Math.round(finalResults[0].score * 2), 100) : 0
        };
    }

    private detectIntent(processed: any): string {
        if (processed.entities.isVIP) return 'paket_vip';
        if (processed.entities.isReguler) return 'paket_reguler';
        if (processed.entities.isLocation) return 'alamat';
        if (processed.entities.isContact) return 'kontak';
        if (processed.tokens.includes('paket')) return 'paket_umum';
        if (processed.tokens.includes('layanan')) return 'layanan';
        return 'fuzzy';
    }
}
