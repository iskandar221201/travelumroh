import type { SearchDataItem, SearchResult } from "../types/search";
import { dynamicPageIndex, type PageContent } from "./page-content-index";

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
        packageQueries: number; // Track how many times user asks about packages
        totalQueries: number; // Total search count
    };
    private keywordFuse: any;
    private CORE_KEYWORDS = [
        'umroh', 'haji', 'paket', 'kontak', 'alamat', 'assalamualaikum',
        'biaya', 'harga', 'syarat', 'dokumen', 'lokasi', 'kantor',
        'daftar', 'registrasi', 'layanan', 'fasilitas', 'promo',
        'hemat', 'eksklusif', 'premium', 'jadwal', 'keberangkatan',
        'pendaftaran', 'berkas', 'hubungi', 'nomor', 'wa', 'whatsapp'
    ];

    private phoneticMap: Record<string, string[]> = {
        'umroh': ['omroh', 'umro', 'umrokh', 'unroh'],
        'haji': ['haji', 'haj', 'haji'],
        'syarat': ['syrat', 'sarat', 'siarat', 'persyaratan'],
        'paket': ['pakit', 'pake', 'pket'],
        'vip': ['vip', 'vif', 'fip'],
        'reguler': ['reguler', 'regerul', 'regler'],
        'manasik': ['manasik', 'nasik', 'mansik', 'manasek'],
        'kantor': ['kantor', 'kanter', 'kntr'],
        'alamat': ['alamat', 'lamat', 'lmmat'],
    };

    private semanticMap: Record<string, string[]> = {
        'syarat': ['dokumen', 'berkas', 'file', 'akta', 'nikah', 'kk', 'ktp'],
        'biaya': ['harga', 'tarif', 'bayar', 'duit', 'uang', 'mahal', 'murah', 'berapa', 'berapa harga'],
        'lokasi': ['alamat', 'kantor', 'dimana', 'maps', 'cirebon', 'mundu'],
        'layanan': ['fasilitas', 'fitur', 'sarana', 'dapat', 'apa', 'servis', 'service', 'keunggulan', 'bonus', 'gratis'],
        'kontak': ['hubungi', 'wa', 'whatsapp', 'nomor', 'telfon', 'telepon', 'admin', 'cs', 'customer service', 'chat', 'bicara'],
        'pendaftaran': ['daftar', 'join', 'registrasi', 'gimana', 'cara', 'bagaimana', 'booking', 'pesan'],
        'murah': ['hemat', 'ekonomis', 'promo', 'terjangkau', 'miring', 'diskon', 'termurah'],
        'eksklusif': ['mewah', 'premium', 'high-end', 'business', 'terbaik'],
        'manasik': ['bimbingan', 'latihan', 'persiapan', 'pelatihan', 'ihram', 'tawaf', 'sai', 'tahallul'],
        'urgent': ['cepat', 'segera', 'sekarang', 'langsung', 'urgent', 'mendesak'],
        'slot': ['tersedia', 'kosong', 'penuh', 'kuota', 'sisa'],
    };

    // Advanced synonym map for contextual understanding
    private synonymMap: Record<string, string> = {
        'pengen': 'mau',
        'pingin': 'mau',
        'ingin': 'mau',
        'butuh': 'perlu',
        'cari': 'mencari',
        'nyari': 'mencari',
        'tanya': 'bertanya',
        'nanya': 'bertanya',
        'minta': 'meminta',
        'tolong': 'bantu',
        'kasi': 'kasih',
        'pake': 'pakai',
        'udah': 'sudah',
        'blom': 'belum',
        'gak': 'tidak',
        'ga': 'tidak',
        'nggak': 'tidak',
        'gmn': 'gimana',
        'gmana': 'gimana',
        'brp': 'berapa',
        'brapa': 'berapa',
        'dmn': 'dimana',
        'kpn': 'kapan',
        'klo': 'kalau',
        'kalo': 'kalau',
    };

    // Multi-word phrase patterns for better context
    private phrasePatterns = [
        { pattern: ['berapa', 'harga'], intent: 'pricing', boost: 30 },
        { pattern: ['berapa', 'biaya'], intent: 'pricing', boost: 30 },
        { pattern: ['cara', 'daftar'], intent: 'registration', boost: 40 },
        { pattern: ['gimana', 'daftar'], intent: 'registration', boost: 40 },
        { pattern: ['mau', 'booking'], intent: 'booking', boost: 50 },
        { pattern: ['mau', 'daftar'], intent: 'booking', boost: 50 },
        { pattern: ['dimana', 'kantor'], intent: 'location', boost: 35 },
        { pattern: ['nomor', 'wa'], intent: 'contact', boost: 45 },
        { pattern: ['nomor', 'whatsapp'], intent: 'contact', boost: 45 },
        { pattern: ['paket', 'murah'], intent: 'budget_package', boost: 40 },
        { pattern: ['paket', 'hemat'], intent: 'budget_package', boost: 40 },
        { pattern: ['paket', 'vip'], intent: 'premium_package', boost: 40 },
        { pattern: ['paket', 'terbaik'], intent: 'premium_package', boost: 35 },
    ];

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
            packageQueries: 0,
            totalQueries: 0
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

        this.keywordFuse = Fuse ? new Fuse(this.CORE_KEYWORDS, {
            threshold: 0.35,
            distance: 100,
            location: 0,
            includeScore: true
        }) : null;
    }

    // Levenshtein distance for fuzzy spell checking
    private levenshteinDistance(str1: string, str2: string): number {
        const matrix: number[][] = [];
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        return matrix[str2.length][str1.length];
    }

    // Check if query is about packages (for sales tracking)
    private isPackageRelated(words: string[]): boolean {
        const packageKeywords = [
            'paket', 'harga', 'biaya', 'bayar', 'murah', 'mahal',
            'vip', 'reguler', 'eksklusif', 'premium', 'hemat',
            'booking', 'daftar', 'pesan', 'berapa', 'promo'
        ];
        return words.some(w => packageKeywords.includes(w));
    }

    // Advanced auto-correct with fuzzy matching
    private autoCorrect(word: string): string {
        for (const [correct, typos] of Object.entries(this.phoneticMap)) {
            if (typos.includes(word)) return correct;
        }
        return word;
    }

    private extractEntities(words: string[]) {
        const entities = {
            isLocation: words.some(w => ['cirebon', 'mundu', 'banjarwangunan'].includes(w)),
            isVIP: words.some(w => ['vip', 'premium', 'mewah', 'eksklusif', 'terbaik'].includes(w)),
            isReguler: words.some(w => ['reguler', 'hemat', 'murah', 'ekonomis'].includes(w)),
            isLegalitas: words.some(w => ['resmi', 'izin', 'legal', 'ppiu'].includes(w)),
            isContact: words.some(w => ['wa', 'telepon', 'kontak', 'hubungi', 'telfon', 'chat', 'admin'].includes(w)),
            isManasik: words.some(w => ['manasik', 'bimbingan', 'pelatihan', 'ihram', 'tawaf', 'sai'].includes(w)),
            isUrgent: words.some(w => ['cepat', 'segera', 'sekarang', 'urgent', 'booking', 'daftar'].includes(w)),
            isPricing: words.some(w => ['harga', 'biaya', 'bayar', 'murah', 'mahal', 'berapa'].includes(w)),
            isComparison: words.some(w => ['beda', 'bedanya', 'perbandingan', 'compare', 'vs', 'bandingkan', 'perbedaan'].includes(w)),
        };

        Object.keys(entities).forEach(key => {
            if ((entities as any)[key]) this.history.detectedEntities.add(key);
        });

        return entities;
    }

    private preprocess(query: string) {
        const rawWords = query.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 1);

        // Auto-correct
        const correctedWords = rawWords.map(w => this.autoCorrect(w));
        const filteredWords = correctedWords.filter(w => !this.stopWords.has(w));

        // Semantic expansion
        const expansion: string[] = [];
        filteredWords.forEach(w => {
            if (this.semanticMap[w]) expansion.push(...this.semanticMap[w]);
        });

        return {
            original: query,
            tokens: filteredWords,
            expanded: [...new Set([...filteredWords, ...expansion])],
            entities: this.extractEntities(filteredWords),
            isPackageQuery: this.isPackageRelated(filteredWords)
        }
    }

    private calculateCompositeScore(item: SearchDataItem, processed: any): number {
        let score = 0;
        const text = (item.title + ' ' + (item.keywords || []).join(' ') + ' ' + item.description).toLowerCase();

        // Token-based scoring with position awareness
        processed.tokens.forEach((token: string, i: number) => {
            if (text.includes(token)) {
                score += 10;
                // Bigram bonus (consecutive word match)
                if (i > 0 && text.includes(processed.tokens[i - 1] + ' ' + token)) score += 5;
            }
        });

        // Multi-word phrase exact match
        if (processed.tokens.length > 1) {
            const combined = processed.tokens.join(' ');
            if (item.title.toLowerCase().includes(combined)) score += 20;
        }

        // Entity-based boosting
        if (processed.entities.isVIP && item.title.includes('VIP')) score += 25;
        if (processed.entities.isReguler && item.title.includes('Reguler')) score += 25;
        if (processed.entities.isLocation && item.category === 'Kontak') score += 15;
        if (processed.entities.isManasik && (item.category === 'Manasik' || item.title.toLowerCase().includes('manasik'))) score += 30;
        if (processed.entities.isUrgent && item.category === 'Paket') score += 20;
        if (processed.entities.isPricing && item.category === 'Paket') score += 20;

        if (this.history.lastCategory === item.category) score += 10;

        // Intent-based boosting (Massive boost if item matches detected intent)
        const intent = this.detectIntent(processed);
        if (intent === 'kontak' && item.category === 'Kontak') score += 60;
        if (intent === 'alamat' && item.category === 'Kontak') score += 50;
        if ((intent === 'paket_vip' || intent === 'paket_reguler' || intent === 'paket_umum') && (item.category === 'Paket' || item.category === 'Layanan')) score += 40;
        if (intent === 'manasik' && (item.category === 'Manasik' || item.title.toLowerCase().includes('manasik'))) score += 50;
        if (intent === 'booking' && (item.category === 'Paket' || item.category === 'Pembayaran')) score += 35;

        // Context-aware boosting (if last interaction was about VIP, boost VIP items)
        this.history.detectedEntities.forEach(entity => {
            if (entity === 'isVIP' && item.title.includes('VIP')) score += 10;
            if (entity === 'isReguler' && item.title.includes('Reguler')) score += 10;
        });

        // Direct keyword hit on title/category (Very important for single word queries)
        processed.tokens.forEach((token: string) => {
            if (item.title.toLowerCase().includes(token)) score += 20;
            if (item.category.toLowerCase().includes(token)) score += 25;
            if (item.keywords?.some((k: string) => k.toLowerCase() === token)) score += 15;
        });

        return score;
    }

    public search(query: string): SearchResult {
        const processed = this.preprocess(query);
        let candidates: any[] = [];

        if (this.fuse) {
            const fuseResults = this.fuse.search(processed.expanded.join(' | '));
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

        let topMatches = finalResults
            .filter(r => r.score > 10)
            .map(r => r.item)
            .slice(0, 5);

        // 🧠 DYNAMIC CONTENT LEARNING FALLBACK
        // If results are poor, search through actual page content
        const confidence = finalResults.length > 0 ? Math.min(Math.round(finalResults[0].score * 2), 100) : 0;

        if (topMatches.length < 3 || confidence < 40) {
            const dynamicResults = this.searchPageContent(query, processed);

            // Merge with existing results, prioritizing dynamic if better
            if (dynamicResults.length > 0) {
                // Convert PageContent to SearchDataItem format
                const syntheticResults: SearchDataItem[] = dynamicResults.map(page => ({
                    title: this.extractRelevantHeading(page, processed.tokens) || page.title,
                    description: this.extractRelevantParagraph(page, processed.tokens) || page.paragraphs[0] || '',
                    url: page.url,
                    category: this.inferCategory(page.url),
                    keywords: page.keywords,
                    is_recommended: false,
                    price_numeric: 0
                }));

                // Add synthetic results
                topMatches = [...syntheticResults.slice(0, 2), ...topMatches].slice(0, 5);
            }
        }

        // 🎯 SALES INTELLIGENCE: Track conversation for WhatsApp CTA
        this.history.totalQueries++;
        if (processed.isPackageQuery) {
            this.history.packageQueries++;
        }

        // Trigger WhatsApp CTA after multiple package queries
        const shouldShowWhatsApp = this.history.packageQueries >= 2 || this.history.totalQueries >= 3;
        const whatsappMessage = shouldShowWhatsApp
            ? `Halo! Saya tertarik dengan paket umroh. Bisa dibantu info lengkapnya?`
            : '';

        // Generate comparison if requested
        const comparisonData = processed.entities.isComparison ? this.generateComparison() : null;

        return {
            results: topMatches,
            intent: this.detectIntent(processed),
            entities: processed.entities,
            confidence: Math.max(confidence, topMatches.length > 0 ? 50 : 0),
            shouldShowWhatsApp,
            whatsappMessage,
            queryCount: this.history.totalQueries,
            packageQueryCount: this.history.packageQueries,
            comparison: comparisonData
        };
    }

    // Search through dynamic page content
    private searchPageContent(query: string, processed: any): PageContent[] {
        const queryLower = query.toLowerCase();
        const results: { page: PageContent; score: number }[] = [];

        for (const page of dynamicPageIndex) {
            let score = 0;

            // Check title
            if (page.title.toLowerCase().includes(queryLower)) score += 15;

            // Check with processed tokens
            processed.tokens.forEach((token: string) => {
                if (page.title.toLowerCase().includes(token)) score += 8;

                page.headings.forEach(heading => {
                    if (heading.toLowerCase().includes(token)) score += 6;
                });

                page.paragraphs.forEach(para => {
                    if (para.toLowerCase().includes(token)) score += 3;
                });

                page.keywords.forEach(kw => {
                    if (kw.toLowerCase() === token) score += 10;
                    if (kw.toLowerCase().includes(token)) score += 5;
                });
            });

            if (score > 10) {
                results.push({ page, score });
            }
        }

        results.sort((a, b) => b.score - a.score);
        return results.map(r => r.page).slice(0, 3);
    }

    // Extract most relevant heading
    private extractRelevantHeading(page: PageContent, tokens: string[]): string | null {
        for (const heading of page.headings) {
            for (const token of tokens) {
                if (heading.toLowerCase().includes(token)) {
                    return heading;
                }
            }
        }
        return null;
    }

    // Extract most relevant paragraph with sentence-level intelligence
    private extractRelevantParagraph(page: PageContent, tokens: string[]): string | null {
        const allSentences: { sentence: string; score: number; paragraph: string }[] = [];

        // Break all paragraphs into sentences
        for (const para of page.paragraphs) {
            const sentences = this.splitIntoSentences(para);

            for (const sentence of sentences) {
                let score = 0;
                const sentenceLower = sentence.toLowerCase();

                // Score each sentence based on token matches
                tokens.forEach(token => {
                    if (sentenceLower.includes(token)) {
                        score += 10;
                        // Bonus for exact word match
                        const words = sentenceLower.split(/\s+/);
                        if (words.includes(token)) score += 5;
                    }
                });

                // Bonus for multi-token matches
                if (tokens.length > 1) {
                    const combinedTokens = tokens.join(' ');
                    if (sentenceLower.includes(combinedTokens)) score += 20;
                }

                if (score > 0) {
                    allSentences.push({ sentence, score, paragraph: para });
                }
            }
        }

        if (allSentences.length === 0) {
            // Fallback to first paragraph
            return page.paragraphs[0] || null;
        }

        // Sort by score and get top sentences
        allSentences.sort((a, b) => b.score - a.score);

        // Return top 1-2 most relevant sentences
        if (allSentences.length === 1) {
            return allSentences[0].sentence;
        } else if (allSentences.length >= 2) {
            // Check if top 2 sentences are from same paragraph
            const top1 = allSentences[0];
            const top2 = allSentences[1];

            if (top1.paragraph === top2.paragraph) {
                // Combine in proper order
                const sentences = this.splitIntoSentences(top1.paragraph);
                const idx1 = sentences.indexOf(top1.sentence);
                const idx2 = sentences.indexOf(top2.sentence);

                if (idx1 < idx2) {
                    return `${top1.sentence} ${top2.sentence}`;
                } else {
                    return `${top2.sentence} ${top1.sentence}`;
                }
            } else {
                // Different paragraphs, return best one
                return top1.sentence;
            }
        }

        return allSentences[0].sentence;
    }

    // Split paragraph into sentences intelligently
    private splitIntoSentences(paragraph: string): string[] {
        // Split by . ! ? but preserve abbreviations and numbers
        const sentences = paragraph
            .replace(/(\d+)\.(\d+)/g, '$1DECIMAL$2') // Protect decimals
            .replace(/(Mr|Mrs|Ms|Dr|Prof|Jr|Sr)\.\s/g, '$1ABBREV ') // Protect titles
            .split(/[.!?]+\s+/)
            .map(s => s.trim())
            .map(s => s.replace(/DECIMAL/g, '.').replace(/ABBREV/g, '.'))
            .filter(s => s.length > 10); // Filter out very short fragments

        return sentences;
    }

    // Infer category from URL
    private inferCategory(url: string): string {
        if (url.includes('service')) return 'Paket';
        if (url.includes('about')) return 'Informasi';
        if (url.includes('contact')) return 'Kontak';
        return 'Informasi';
    }

    // Generate dynamic package comparison
    private generateComparison() {
        // Extract all packages from search data
        const packages = this.searchData.filter(item =>
            item.category === 'Paket' &&
            (item.title.includes('Paket Reguler') || item.title.includes('Paket VIP') || item.title.includes('Paket Eksklusif'))
        ).sort((a, b) => (a.price_numeric || 0) - (b.price_numeric || 0)); // Sort by price

        if (packages.length === 0) return null;

        // Extract features dynamically from descriptions
        const extractFeatures = (description: string) => {
            const features = [];
            if (description.includes('hotel bintang 3')) features.push({ label: 'Hotel', value: '⭐⭐⭐ Bintang 3' });
            if (description.includes('hotel bintang 4')) features.push({ label: 'Hotel', value: '⭐⭐⭐⭐ Bintang 4' });
            if (description.includes('hotel bintang 5')) features.push({ label: 'Hotel', value: '⭐⭐⭐⭐⭐ Bintang 5' });

            if (description.includes('9 hari')) features.push({ label: 'Durasi', value: '9 Hari' });
            if (description.includes('12 hari')) features.push({ label: 'Durasi', value: '12 Hari' });

            if (description.includes('makan 3x')) features.push({ label: 'Meals', value: '3x Sehari' });
            if (description.includes('Fullboard')) features.push({ label: 'Meals', value: 'Fullboard Premium' });

            if (description.includes('city tour')) features.push({ label: 'Bonus', value: '✅ City Tour' });
            if (description.includes('Thaif')) features.push({ label: 'Tour', value: '✅ Thaif' });

            return features;
        };

        return {
            packages: packages.map(pkg => ({
                name: pkg.title,
                price: pkg.price_numeric ? `Rp ${(pkg.price_numeric / 1000000).toFixed(1)} Juta` : 'Hubungi Admin',
                features: extractFeatures(pkg.description),
                description: pkg.description,
                url: pkg.url,
                is_recommended: pkg.is_recommended
            }))
        };
    }

    private detectIntent(processed: any): string {
        const words = processed.tokens;
        if (processed.entities.isContact || words.includes('kontak') || words.includes('hubungi')) return 'kontak';
        if (processed.entities.isManasik || words.includes('manasik') || words.includes('bimbingan')) return 'manasik';
        if (processed.entities.isUrgent || words.includes('booking') || words.includes('daftar') || words.includes('pesan')) return 'booking';
        if (processed.entities.isVIP) return 'paket_vip';
        if (processed.entities.isReguler) return 'paket_reguler';
        if (processed.entities.isLocation || words.includes('kantor') || words.includes('alamat')) return 'alamat';
        if (words.includes('paket') || words.includes('harga') || words.includes('biaya')) return 'paket_umum';
        if (words.includes('layanan') || words.includes('fasilitas')) return 'layanan';
        return 'fuzzy';
    }
}
