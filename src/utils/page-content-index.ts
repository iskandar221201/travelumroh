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
            "Wujudkan Impian Umroh Bersama Al-Bait Tour & Travel",
            "Paket Umroh Terbaik 2026",
            "Mengapa Memilih Al-Bait Tour & Travel?",
            "Testimoni Jamaah Terpercaya",
            "Pertanyaan Umum Seputar Umroh",
            "Legalitas Resmi PPIU Kemenag RI",
            "Fasilitas Premium untuk Jamaah",
            "Pembimbing Berpengalaman Lulusan Timur Tengah"
        ],
        paragraphs: [
            "Al-Bait Tour & Travel adalah nama travel umroh dan haji resmi yang terdaftar di Kementerian Agama RI dengan pengalaman lebih dari 10 tahun melayani ribuan jamaah.",
            "Nama perusahaan kami adalah Al-Bait Tour & Travel, berkantor di Cirebon, Jawa Barat. Kami melayani paket umroh reguler, VIP, dan eksklusif dengan harga terjangkau.",
            "Kami menyediakan paket umroh reguler 9 hari mulai dari 28.5 juta rupiah, paket VIP 12 hari 35.5 juta, dan paket eksklusif 9 hari 42.5 juta dengan fasilitas lengkap.",
            "Fasilitas lengkap meliputi: hotel dekat masjid (bintang 3, 4, atau 5), mutawif berpengalaman dari Timur Tengah, bimbingan manasik gratis, dokumentasi profesional, dan perlengkapan umroh.",
            "Lebih dari 5000 jamaah telah mempercayakan ibadah umroh dan haji mereka bersama Al-Bait Tour & Travel dengan tingkat kepuasan 100%.",
            "Legalitas resmi PPIU Kemenag dengan SK Nomor 91204049913930001, pelayanan profesional dengan harga yang transparan dan terpercaya.",
            "Setiap paket sudah termasuk tiket pesawat pulang pergi, visa Saudi, asuransi perjalanan, hotel bintang dekat masjid, makan 3x sehari prasmanan menu Indonesia, transportasi bus AC full, dan ziarah lengkap.",
            "Tim pembimbing kami adalah lulusan universitas Timur Tengah yang fasih berbahasa Arab dan berpengalaman membimbing ribuan jamaah.",
            "Manasik umroh GRATIS diberikan minimal 1x (teori dan praktik) untuk semua jamaah sebelum keberangkatan, dipandu langsung oleh ustadz berpengalaman.",
            "Al-Bait Tour & Travel melayani jamaah dari seluruh Indonesia, khususnya wilayah Cirebon, Indramayu, Kuningan, Majalengka, Brebes, dan sekitarnya."
        ],
        keywords: [
            "umroh", "travel", "cirebon", "resmi", "kemenag", "ppiu", "jamaah", "paket", "murah", "terpercaya",
            "al-bait", "al bait", "albait", "tour travel", "nama travel", "travel umroh", "travel haji",
            "umroh cirebon", "haji cirebon", "paket murah", "terjangkau", "berkualitas", "profesional",
            "10 tahun", "berpengalaman", "5000 jamaah", "kepuasan", "testimoni", "rekomendasi"
        ]
    },
    {
        url: "/services",
        title: "Paket Umroh Lengkap - Al-Bait Tour & Travel",
        headings: [
            "Paket Umroh Terlengkap 2026",
            "Paket Reguler 9 Hari - Murah dan Berkualitas",
            "Paket VIP 12 Hari - Terlaris dan Recommended",
            "Paket Eksklusif 9 Hari - Premium Business Class",
            "Fasilitas Lengkap Semua Paket",
            "Itinerary Perjalanan Detail",
            "Perbandingan Paket Umroh",
            "Hotel Bintang Dekat Masjid",
            "Pembimbing dan Mutawif Berpengalaman"
        ],
        paragraphs: [
            "Al-Bait Tour & Travel menawarkan tiga pilihan paket umroh: Paket Reguler 9 hari dengan harga 28.5 juta rupiah menggunakan hotel bintang 3, makan 3x sehari, dan pembimbing berpengalaman.",
            "Paket VIP 12 hari seharga 35.5 juta rupiah adalah paket terlaris kami dengan hotel bintang 4 yang sangat dekat dengan masjid, city tour ke Thaif, dan berbagai fasilitas premium lainnya.",
            "Paket Eksklusif 9 hari dengan harga 42.5 juta rupiah menawarkan hotel bintang 5 tepat di depan pelataran masjid, pesawat business class, private transport, dan dokumentasi eksklusif.",
            "Semua paket sudah termasuk tiket pesawat pulang pergi (PP), pengurusan visa Saudi Arabia, akomodasi hotel mewah dekat masjid, makan prasmanan 3x sehari menu Indonesia, transportasi bus AC, dan perlengkapan umroh lengkap.",
            "Bimbingan manasik umroh GRATIS untuk semua jamaah, dipandu tour leader berpengalaman lulusan Timur Tengah, ziarah lengkap ke tempat-tempat bersejarah, dan dokumentasi profesional selama perjalanan.",
            "Hotel di Mekkah: Bintang 5 (Movenpick/Anjum), Bintang 4 (Elaf Kinda/Retaj Al Hayat), Bintang 3 (Fajr Al Badeea) dengan jarak sangat dekat ke Masjidil Haram.",
            "Hotel di Madinah: Pullman Zamzam, Dallah Taibah, Odst Madinah yang berjarak hanya beberapa langkah dari Masjid Nabawi.",
            "Maskapai penerbangan premium: Saudi Arabian Airlines, Garuda Indonesia, atau Emirates dengan direct flight atau maksimal 1x transit.",
            "Ziarah lengkap di Madinah meliputi Masjid Quba, Kebun Kurma, Jabal Uhud. Ziarah di Mekkah meliputi Jabal Tsur, Jabal Nur, Arafah, Muzdalifah, dan Mina.",
            "Fasilitas perlengkapan: Koper berkualitas, Tas Paspor, Kain Ihram untuk laki-laki atau Mukena untuk perempuan, Seragam Batik, Buku Doa lengkap, dan ID Card jamaah."
        ],
        keywords: [
            "paket", "harga", "reguler", "vip", "eksklusif", "28 juta", "35 juta", "42 juta", "fasilitas", "hotel",
            "paket umroh", "paket murah", "paket terlaris", "recommended", "28.5 juta", "35.5 juta", "42.5 juta",
            "bintang 3", "bintang 4", "bintang 5", "dekat masjid", "hotel dekat", "hotel mewah",
            "business class", "garuda", "saudi airlines", "emirates", "pesawat", "penerbangan",
            "ziarah", "tour", "city tour", "thaif", "quba", "uhud", "arafah", "mina",
            "manasik gratis", "bimbingan", "mutawif", "pembimbing", "ustadz", "tour leader"
        ]
    },
    {
        url: "/about",
        title: "Tentang Kami - Al-Bait Tour & Travel Cirebon",
        headings: [
            "Profil Al-Bait Tour & Travel",
            "Nama Perusahaan dan Identitas",
            "Visi & Misi Melayani Tamu Allah",
            "Pengalaman 10+ Tahun Melayani Jamaah",
            "Legalitas Resmi PPIU Kemenag RI",
            "Tim Profesional Lulusan Timur Tengah",
            "Lebih dari 5000 Jamaah Terlayani",
            "Komitmen Pelayanan Terbaik"
        ],
        paragraphs: [
            "Al-Bait Tour & Travel adalah nama resmi perusahaan kami, sebuah travel umroh dan haji yang telah berpengalaman lebih dari 10 tahun dalam melayani ribuan jamaah dengan profesional.",
            "Nama lengkap perusahaan kami adalah Al-Bait Tour & Travel, terdaftar resmi di Kementerian Agama Republik Indonesia dengan nomor SK PPIU 91204049913930001.",
            "Kami berkantor di Cirebon, Jawa Barat, dan telah melayani lebih dari 5000 jamaah umroh dan haji dengan tingkat kepuasan mencapai 100 persen.",
            "Visi kami adalah melayani tamu Allah dengan penuh keikhlasan dan profesionalitas tinggi, sesuai dengan ajaran sunnah Nabi Muhammad SAW.",
            "Misi Al-Bait Tour & Travel adalah memberikan pelayanan umroh dan haji terbaik dengan bimbingan yang sesuai sunnah, fasilitas premium, dan harga yang transparan.",
            "Tim kami terdiri dari mutawif dan pembimbing berpengalaman yang merupakan lulusan dari universitas-universitas terkemuka di Timur Tengah dan fasih berbahasa Arab.",
            "Sebagai travel umroh resmi, kami memiliki legalitas lengkap dari Kementerian Agama RI, sehingga jamaah dapat berangkat dengan tenang dan aman.",
            "Al-Bait Tour & Travel berkomitmen memberikan pengalaman ibadah yang khusyuk, nyaman, dan berkesan bagi setiap jamaah yang mempercayakan perjalanan suci mereka kepada kami.",
            "Dengan pengalaman satu dekade lebih, kami memahami kebutuhan jamaah dan selalu berupaya memberikan pelayanan terbaik dari proses pendaftaran hingga kepulangan.",
            "Kepercayaan ribuan jamaah adalah amanah besar bagi Al-Bait Tour & Travel untuk terus meningkatkan kualitas layanan dan memberikan yang terbaik."
        ],
        keywords: [
            "profil", "legalitas", "ppiu", "kemenag", "pengalaman", "10 tahun", "5000 jamaah", "resmi", "terpercaya",
            "al-bait", "al bait", "albait", "tour travel", "nama travel", "nama perusahaan", "identitas",
            "visi", "misi", "komitmen", "profesional", "ikhlas", "sunnah", "melayani tamu allah",
            "mutawif", "pembimbing", "tim profesional", "lulusan timur tengah", "bahasa arab",
            "kepuasan", "100 persen", "terlayani", "terpercaya", "aman", "nyaman", "berkualitas"
        ]
    },
    {
        url: "/contact",
        title: "Hubungi Kami - Al-Bait Tour & Travel Cirebon",
        headings: [
            "Informasi Kontak Al-Bait Tour & Travel",
            "Alamat Kantor di Cirebon",
            "Jam Operasional Kantor",
            "Nomor Telepon dan WhatsApp",
            "Hubungi Kami untuk Konsultasi Gratis",
            "Customer Service Siap Melayani",
            "Kunjungi Kantor Kami"
        ],
        paragraphs: [
            "Kantor Al-Bait Tour & Travel berlokasi di Jl. Raya Banjarwangunan, RT.001/RW.004, Kecamatan Mundu, Kabupaten Cirebon, Jawa Barat 45171.",
            "Jam operasional kantor kami adalah Senin sampai Jumat pukul 08:30 hingga 16:30 WIB, dan hari Sabtu dari pukul 08:30 hingga 13:00 WIB.",
            "Untuk informasi lebih lanjut, hubungi kami di nomor telepon kantor 0231-222461 atau melalui WhatsApp di nomor 0812 2244 2100 yang siap melayani 24 jam.",
            "Tim customer service Al-Bait Tour & Travel siap memberikan konsultasi gratis seputar pendaftaran umroh, informasi paket, dan menjawab semua pertanyaan Anda.",
            "Anda juga sangat dipersilakan untuk mengunjungi kantor kami secara langsung untuk konsultasi tatap muka dan mendapatkan informasi lebih detail tentang paket umroh.",
            "Alamat lengkap kami di Jalan Raya Banjarwangunan, Mundu, Cirebon, mudah dijangkau dan dekat dengan akses jalan utama.",
            "Hubungi WhatsApp 0812 2244 2100 untuk respons cepat, atau telepon ke 0231-222461 untuk berbicara langsung dengan tim kami.",
            "Customer service kami yang ramah dan profesional siap membantu Anda mewujudkan impian beribadah umroh ke tanah suci."
        ],
        keywords: [
            "kontak", "alamat", "telepon", "whatsapp", "wa", "kantor", "cirebon", "mundu", "banjarwangunan", "jam buka",
            "hubungi", "nomor telepon", "nomor wa", "0812 2244 2100", "0231-222461", "customer service",
            "konsultasi gratis", "cs", "admin", "chat", "call", "telepon kantor",
            "lokasi", "alamat kantor", "dimana kantornya", "kantor cirebon", "mundu cirebon",
            "jam operasional", "buka jam berapa", "jam kerja", "senin jumat", "sabtu"
        ]
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
