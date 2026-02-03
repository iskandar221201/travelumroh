// Dynamic Page Content Indexer
// This file is used by search-engine.ts as fallback when search-data.json doesn't have results

export interface PageContent {
    url: string;
    title: string;
    headings: string[];
    paragraphs: string[];
    keywords: string[];
}

export const dynamicPageIndex: PageContent[] = [
    {
        url: "/",
        title: "Al-Bait Tour & Travel - Umroh Terpercaya Cirebon",
        headings: [
            "Wujudkan Impian Umroh Bersama Al-Bait",
            "Paket Umroh Terbaik",
            "Mengapa Memilih Al-Bait?",
            "Testimoni Jamaah",
            "Pertanyaan Umum"
        ],
        paragraphs: [
            "Travel umroh resmi terdaftar Kemenag RI dengan pengalaman 10+ tahun melayani jamaah.",
            "Kami menyediakan paket reguler, VIP, dan eksklusif dengan harga terjangkau mulai 28.5 juta.",
            "Fasilitas lengkap: hotel dekat masjid, mutawif berpengalaman, manasik gratis, dan dokumentasi.",
            "Lebih dari 5000 jamaah telah mempercayakan ibadah umroh mereka bersama kami.",
            "Legalitas resmi PPIU Kemenag, pelayanan profesional, dan harga transparan."
        ],
        keywords: ["umroh", "travel", "cirebon", "resmi", "kemenag", "ppiu", "jamaah", "paket", "murah", "terpercaya"]
    },
    {
        url: "/services",
        title: "Paket Umroh - Al-Bait Tour & Travel",
        headings: [
            "Paket Umroh Terlengkap",
            "Paket Reguler 9 Hari",
            "Paket VIP 12 Hari",
            "Paket Eksklusif 9 Hari",
            "Fasilitas Lengkap",
            "Itinerary Perjalanan"
        ],
        paragraphs: [
            "Paket Reguler 9 hari dengan harga 28.5 juta - hotel bintang 3, makan 3x sehari, pembimbing berpengalaman.",
            "Paket VIP 12 hari seharga 35.5 juta - hotel bintang 4 dekat masjid, city tour Thaif, fasilitas premium.",
            "Paket Eksklusif 9 hari 42.5 juta - hotel bintang 5 depan pelataran, business class, private transport.",
            "Termasuk tiket pesawat PP, visa, akomodasi hotel, makan prasmanan, transportasi, perlengkapan umroh.",
            "Bimbingan manasik gratis, tour leader berpengalaman, ziarah lengkap, dokumentasi profesional."
        ],
        keywords: ["paket", "harga", "reguler", "vip", "eksklusif", "28 juta", "35 juta", "42 juta", "fasilitas", "hotel"]
    },
    {
        url: "/about",
        title: "Tentang Kami - Al-Bait Tour & Travel",
        headings: [
            "Profil Al-Bait Tour & Travel",
            "Visi & Misi",
            "Pengalaman Kami",
            "Legalitas Resmi",
            "Tim Profesional"
        ],
        paragraphs: [
            "Al-Bait Tour & Travel adalah travel umroh resmi yang telah berpengalaman lebih dari 10 tahun.",
            "Terdaftar resmi di Kementerian Agama RI dengan nomor SK PPIU 91204049913930001.",
            "Telah melayani lebih dari 5000 jamaah dengan tingkat kepuasan 100 persen.",
            "Visi kami adalah melayani tamu Allah dengan ikhlas dan profesional sesuai sunnah.",
            "Tim kami terdiri dari mutawif berpengalaman lulusan Timur Tengah yang fasih bahasa Arab."
        ],
        keywords: ["profil", "legalitas", "ppiu", "kemenag", "pengalaman", "10 tahun", "5000 jamaah", "resmi", "terpercaya"]
    },
    {
        url: "/contact",
        title: "Hubungi Kami - Al-Bait Tour & Travel",
        headings: [
            "Informasi Kontak",
            "Alamat Kantor",
            "Jam Operasional",
            "Hubungi Kami"
        ],
        paragraphs: [
            "Kantor kami berlokasi di Jl. Raya Banjarwangunan, RT.001/RW.004, Kec. Mundu, Kab. Cirebon, Jawa Barat 45171.",
            "Buka Senin - Jumat pukul 08:30 - 16:30 WIB dan Sabtu 08:30 - 13:00 WIB.",
            "Hubungi kami di nomor telepon 0231-222461 untuk kantor atau WhatsApp 0812 2244 2100.",
            "Tim customer service kami siap melayani konsultasi gratis seputar pendaftaran umroh.",
            "Anda juga bisa mengunjungi kantor kami langsung untuk konsultasi tatap muka."
        ],
        keywords: ["kontak", "alamat", "telepon", "whatsapp", "wa", "kantor", "cirebon", "mundu", "banjarwangunan", "jam buka"]
    }
];

// Helper function to search in dynamic content
export function searchDynamicContent(query: string): PageContent[] {
    const queryLower = query.toLowerCase();
    const results: PageContent[] = [];

    for (const page of dynamicPageIndex) {
        let relevance = 0;

        // Check title
        if (page.title.toLowerCase().includes(queryLower)) relevance += 10;

        // Check headings
        for (const heading of page.headings) {
            if (heading.toLowerCase().includes(queryLower)) relevance += 5;
        }

        // Check paragraphs
        for (const paragraph of page.paragraphs) {
            if (paragraph.toLowerCase().includes(queryLower)) relevance += 3;
        }

        // Check keywords
        for (const keyword of page.keywords) {
            if (keyword.toLowerCase().includes(queryLower) || queryLower.includes(keyword.toLowerCase())) {
                relevance += 7;
            }
        }

        if (relevance > 0) {
            results.push(page);
        }
    }

    // Sort by relevance (we'll need to attach relevance scores)
    return results;
}
