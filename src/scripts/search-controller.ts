import { SearchEngine } from "../utils/search-engine";
import type { SearchDataItem, SearchResult } from "../types/search";

export class SearchController {
    private engine: SearchEngine;
    private overlay: HTMLElement | null;
    private input: HTMLInputElement | null;
    private sendBtn: HTMLElement | null;
    private closeBtn: HTMLElement | null;
    private chatContainer: HTMLElement | null;
    private messagesList: HTMLElement | null;
    private typingIndicator: HTMLElement | null;
    private quickLinks: NodeListOf<Element>;
    private welcomeMsg: HTMLElement | null;
    private whatsappNumber: string;

    private conversationContext = {
        lastMatchedItem: null as SearchDataItem | null,
        interactionCount: 0,
        shownUpsell: false,
        shownLeadCapture: false,
    };

    private chatHistory: { type: 'user' | 'assistant', text: string, result?: SearchResult }[] = [];

    private testimonials = [
        { name: "Bu Siti", city: "Cirebon", text: "Pelayanannya luar biasa!" },
        { name: "Pak Ahmad", city: "Jakarta", text: "Pembimbing sangat berpengalaman!" },
        { name: "Ibu Rina", city: "Bandung", text: "Makanannya enak, menu Indonesia!" },
    ];

    constructor(searchData: SearchDataItem[], Fuse: any, whatsappNumber: string) {
        this.engine = new SearchEngine(searchData, Fuse, null);
        this.whatsappNumber = whatsappNumber;

        this.overlay = document.getElementById("search-overlay");
        this.input = document.getElementById("search-input") as HTMLInputElement;
        this.sendBtn = document.getElementById("send-btn");
        this.closeBtn = document.getElementById("close-search");
        this.chatContainer = document.getElementById("chat-container");
        this.messagesList = document.getElementById("messages-list");
        this.typingIndicator = document.getElementById("typing-indicator");
        this.quickLinks = document.querySelectorAll(".quick-link-chip");
        this.welcomeMsg = document.querySelector(".assistant-bubble") as HTMLElement;

        this.initEventListeners();
        this.exposeGlobals();
        this.loadHistory();
    }

    private initEventListeners() {
        if (this.input) {
            this.input.addEventListener("keydown", (e) => {
                if (e.key === "Enter") this.performAction();
            });
        }

        if (this.sendBtn) {
            this.sendBtn.addEventListener("click", () => this.performAction());
        }

        if (this.closeBtn) {
            this.closeBtn.addEventListener("click", () => this.closeSearch());
        }

        this.quickLinks.forEach((chip) => {
            const el = chip as HTMLElement;
            el.addEventListener("click", () => {
                if (this.input && el.dataset.query) {
                    this.input.value = el.dataset.query;
                    this.performAction();
                }
            });
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && this.overlay && !this.overlay.classList.contains("hidden")) {
                this.closeSearch();
            }
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                this.openSearch();
            }
        });

        if (this.overlay) {
            this.overlay.addEventListener("click", (e) => {
                if (e.target === this.overlay) this.closeSearch();
            });
        }
    }

    private exposeGlobals() {
        // @ts-ignore
        window.toggleSearch = () => this.openSearch();
        // @ts-ignore
        window.downloadImage = (url: string, filename: string) => this.downloadImage(url, filename);
        // @ts-ignore
        window.clearSearchHistory = () => this.clearHistory();
    }

    public openSearch() {
        if (!this.overlay || !this.input || !this.welcomeMsg) return;
        this.overlay.classList.remove("hidden");
        setTimeout(() => {
            if (this.overlay && this.input && this.welcomeMsg) {
                this.overlay.classList.remove("opacity-0");
                this.input.focus();
                this.welcomeMsg.classList.remove("opacity-0", "translate-y-4");
            }
        }, 10);
        document.body.style.overflow = "hidden";
    }

    public closeSearch() {
        if (!this.overlay || !this.input) return;
        this.overlay.classList.add("opacity-0");
        setTimeout(() => {
            if (this.overlay && this.input) {
                this.overlay.classList.add("hidden");
                this.input.value = "";
            }
        }, 300);
        document.body.style.overflow = "";
    }

    private formatText(text: string): string {
        return text.replace(
            /\*\*(.*?)\*\*/g,
            '<span class="font-bold text-primary">$1</span>',
        );
    }

    private async downloadImage(url: string, filename: string) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = filename || "download.jpg";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Download failed:", error);
            window.open(url, "_blank");
        }
    }

    private scrollToBottom() {
        if (!this.chatContainer) return;
        this.chatContainer.scrollTo({
            top: this.chatContainer.scrollHeight,
            behavior: "smooth",
        });
    }

    private addUserMessage(text: string, save = true) {
        if (!this.messagesList) return;
        const div = document.createElement("div");
        div.className = "flex justify-end gap-4 opacity-0 translate-y-2 transition-all duration-300";
        div.innerHTML = `<div class="bg-primary text-white p-4 rounded-2xl rounded-tr-none shadow-lg max-w-[85%]"><p class="text-sm md:text-base font-medium">${text}</p></div>`;
        this.messagesList.appendChild(div);
        setTimeout(() => div.classList.remove("opacity-0", "translate-y-2"), 10);
        this.scrollToBottom();

        if (save) {
            this.chatHistory.push({ type: 'user', text });
            this.saveHistory();
        }
    }

    private saveHistory() {
        localStorage.setItem('al_bait_chat_history', JSON.stringify(this.chatHistory));
    }

    private loadHistory() {
        const saved = localStorage.getItem('al_bait_chat_history');
        if (saved && this.messagesList) {
            try {
                const history = JSON.parse(saved);
                this.chatHistory = history;
                this.chatHistory.forEach(msg => {
                    if (msg.type === 'user') {
                        this.addUserMessage(msg.text, false);
                    } else if (msg.type === 'assistant' && msg.result) {
                        this.addAssistantMessage(msg.text, msg.result, false);
                    }
                });
            } catch (e) {
                console.error("Failed to load history", e);
            }
        }
    }

    private clearHistory() {
        this.chatHistory = [];
        localStorage.removeItem('al_bait_chat_history');
        if (this.messagesList) this.messagesList.innerHTML = '';
        this.scrollToBottom();
    }

    private addAssistantMessage(query: string, result: SearchResult, save = true) {
        const { intent, results, confidence } = result;
        this.conversationContext.interactionCount++;

        if (save) {
            this.chatHistory.push({ type: 'assistant', text: query, result });
            this.saveHistory();
        }

        const div = document.createElement("div");
        div.className = "flex gap-4 opacity-0 translate-y-2 transition-all duration-500";

        let responseHTML = "";
        let extras = "";

        if (confidence < 30 && results.length > 0) {
            responseHTML = `<p class="text-xs text-gray-400 mb-2 italic">🤔 Saya kurang yakin, tapi mungkin ini yang Anda cari:</p>`;
        }

        if (results.length > 0) {
            const topResult = results[0];
            this.conversationContext.lastMatchedItem = topResult;

            switch (intent) {
                case "paket_vip":
                    responseHTML += `<p class="text-sm md:text-base font-medium">Berikut adalah pilihan **Paket VIP & Eksklusif** kami untuk kenyamanan maksimal ibadah Anda:</p>`;
                    break;
                case "paket_reguler":
                    responseHTML += `<p class="text-sm md:text-base font-medium">Kami memiliki paket **Hemat & Reguler** yang sangat terjangkau namun tetap berkualitas:</p>`;
                    break;
                case "alamat":
                    responseHTML += `<p class="text-sm md:text-base font-medium">Kantor Al-Bait Tour & Travel berlokasi di **Cirebon**. Berikut detail alamatnya:</p>`;
                    break;
                case "kontak":
                    responseHTML += `<p class="text-sm md:text-base font-medium">Silakan hubungi tim kami untuk konsultasi gratis mengenai rencana Umroh Anda:</p>`;
                    break;
                default:
                    if (topResult.category === "Sapaan") {
                        responseHTML = `<p class="text-sm md:text-base font-medium text-dark">${topResult.answer || topResult.description}</p>`;
                    } else {
                        responseHTML += `<p class="text-sm md:text-base">Saya menemukan informasi paling relevan tentang **${topResult.title}**:</p>`;
                    }
            }

            if (topResult.answer && topResult.category !== "Sapaan") {
                responseHTML += `<p class="text-sm md:text-base font-bold text-primary mt-3 bg-primary/5 p-3 rounded-lg border-l-4 border-primary shadow-sm">${topResult.answer}</p>`;
            } else if (!topResult.answer && topResult.category !== "Sapaan") {
                responseHTML += `<p class="text-sm md:text-base mt-2 text-gray-600">${topResult.description}</p>`;
            }
        } else {
            responseHTML = `<p class="text-sm md:text-base">Aduh, saya belum menemukan jawaban yang pas untuk **"${query}"**. Tapi jangan khawatir, saya akan hubungkan Anda ke **WhatsApp Admin** kami sekarang juga! 🚀</p>`;
            setTimeout(() => {
                const waUrl = `https://wa.me/${this.whatsappNumber}?text=Assalamu'alaikum CS Al-Bait, saya ingin bertanya tentang: ${encodeURIComponent(query)}`;
                window.open(waUrl, "_blank");
            }, 2000);
        }

        if (this.conversationContext.lastMatchedItem?.image_url) {
            const imgUrl = this.conversationContext.lastMatchedItem.image_url;
            const title = this.conversationContext.lastMatchedItem.title;
            extras = `<div class="relative group my-4 rounded-xl overflow-hidden shadow-md border border-gray-100">
                        <img src="${imgUrl}" alt="${title}" class="w-full h-44 object-cover transform group-hover:scale-105 transition-transform duration-700"/>
                        <button onclick="downloadImage('${imgUrl}', 'Al-Bait-${title.replace(/\s+/g, "-")}.jpg')" class="absolute top-2 right-2 bg-white/95 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                        </button>
                      </div>` + extras;
        }

        const actionChips = results
            .filter((item) => item.category !== "Sapaan")
            .slice(0, 3)
            .map((item) => `
                <a href="${item.url}" class="action-chip flex items-center justify-between gap-3 p-4 bg-white hover:bg-primary/5 rounded-2xl border border-gray-100 hover:border-primary/40 transition-all group w-full shadow-sm hover:shadow-md">
                    <div class="text-left w-full">
                        <div class="flex items-center justify-between mb-1">
                            <div class="flex items-center gap-2">
                                <span class="text-[8px] font-black text-white bg-primary px-1.5 py-0.5 rounded uppercase tracking-widest">${item.category}</span>
                                ${item.is_recommended ? '<span class="text-[8px] font-black text-white bg-amber-500 px-1.5 py-0.5 rounded uppercase">Bestseller</span>' : ""}
                            </div>
                            ${item.price_numeric && item.price_numeric > 0 ? `<span class="text-[10px] font-bold text-primary">Rp ${(item.price_numeric / 1000000).toFixed(1)}Jt-an</span>` : ""}
                        </div>
                        <h4 class="font-bold text-dark text-sm sm:text-base leading-tight group-hover:text-primary transition-colors">${item.title}</h4>
                    </div>
                    <div class="w-8 h-8 rounded-xl bg-gray-50 group-hover:bg-primary text-primary group-hover:text-white flex items-center justify-center transition-all shrink-0 shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </div>
                </a>`).join("");

        div.innerHTML = `
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-accent shrink-0 shadow-lg hidden md:flex">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            </div>
            <div class="space-y-3 max-w-[90%] md:max-w-[85%]">
                <div class="bg-white p-6 rounded-3xl rounded-tl-none shadow-xl border border-gray-100 text-dark leading-relaxed relative overflow-hidden">
                    <div class="absolute top-0 right-0 p-2 opacity-5">
                        <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017V14H17.017C14.8079 14 13.017 12.2091 13.017 10V7C13.017 5.89543 13.9124 5 15.017 5H19.017C20.1216 5 21.017 5.89543 21.017 7V13C21.017 15.2091 19.2261 17 17.017 17V21H14.017ZM3.01702 21L3.01702 18C3.01702 16.8954 3.91245 16 5.01702 16H8.01702V14H6.01702C3.80788 14 2.01702 12.2091 2.01702 10V7C2.01702 5.89543 2.91245 5 4.01702 5H8.01702C9.12159 5 10.017 5.89543 10.017 7V13C10.017 15.2091 8.22615 17 6.01702 17V21H3.01702Z"/></svg>
                    </div>
                    ${this.formatText(responseHTML)}
                    ${this.formatText(extras)}
                    ${actionChips ? `<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 pt-6 border-t border-gray-100">${actionChips}</div>` : ""}
                </div>
            </div>`;

        if (this.messagesList) {
            this.messagesList.appendChild(div);
            setTimeout(() => div.classList.remove("opacity-0", "translate-y-2"), 10);
            this.scrollToBottom();

            div.querySelectorAll(".action-chip").forEach((el) => {
                const link = el as HTMLAnchorElement;
                link.addEventListener("click", (e) => {
                    const url = new URL(link.href, window.location.origin);
                    if (url.hash && (url.pathname === "/" || url.pathname === window.location.pathname)) {
                        e.preventDefault();
                        this.closeSearch();
                        setTimeout(() => {
                            const target = document.querySelector(url.hash);
                            if (target) {
                                target.scrollIntoView({ behavior: "smooth" });
                                this.highlightSection(url.hash);
                            }
                        }, 400);
                    }
                });
            });
        }
    }

    private highlightSection(sectionId: string) {
        const id = sectionId.startsWith("#") ? sectionId.substring(1) : sectionId;
        const section = document.getElementById(id);
        if (section) {
            section.classList.add("search-highlight");
            setTimeout(() => section.classList.remove("search-highlight"), 3000);
        }
    }

    private showTyping() {
        if (!this.typingIndicator) return;
        this.typingIndicator.classList.remove("hidden");
        setTimeout(() => {
            if (this.typingIndicator) this.typingIndicator.classList.remove("opacity-0");
        }, 10);
        this.scrollToBottom();
    }

    private hideTyping() {
        if (!this.typingIndicator) return;
        this.typingIndicator.classList.add("opacity-0");
        setTimeout(() => {
            if (this.typingIndicator) this.typingIndicator.classList.add("hidden");
        }, 300);
    }

    private performAction() {
        if (!this.input) return;
        const query = this.input.value;
        if (!query.trim()) return;

        this.input.value = "";
        this.addUserMessage(query);
        this.showTyping();

        setTimeout(() => {
            this.hideTyping();
            const result = this.engine.search(query);
            this.addAssistantMessage(query, result);
        }, 1000);
    }
}
