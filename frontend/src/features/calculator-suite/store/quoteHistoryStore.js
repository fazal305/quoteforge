import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const QUOTE_STATUS_LABELS = {
  draft: "Draft",
  prepared: "Prepared",
  sent: "Sent",
  accepted: "Accepted",
  rejected: "Rejected",
  expired: "Expired",
};

const safeLocalStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch {
      // Storage unavailable — saved quotes won't persist this session.
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch {
      // no-op
    }
  },
};

function generateQuoteId() {
  return `qr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function formatQuoteNumber(sequence) {
  const year = new Date().getFullYear();
  return `Q-${year}-${String(sequence).padStart(4, "0")}`;
}

export const useQuoteHistoryStore = create()(
  persist(
    (set, get) => ({
      quotes: [],
      nextQuoteSequence: 1,

      saveQuote: ({ projectTitle, clientName, draft, pricing }) => {
        const now = new Date().toISOString();
        const sequence = get().nextQuoteSequence;
        const record = {
          id: generateQuoteId(),
          quoteNumber: formatQuoteNumber(sequence),
          projectTitle: projectTitle || "Untitled Project",
          clientName: clientName || "Unnamed Client",
          status: "draft",
          createdAt: now,
          updatedAt: now,
          draft,
          pricing,
        };
        set((s) => ({
          quotes: [record, ...s.quotes],
          nextQuoteSequence: s.nextQuoteSequence + 1,
        }));
        return record;
      },

      updateStatus: (id, status) =>
        set((s) => ({
          quotes: s.quotes.map((q) =>
            q.id === id
              ? { ...q, status, updatedAt: new Date().toISOString() }
              : q,
          ),
        })),

      deleteQuote: (id) =>
        set((s) => ({ quotes: s.quotes.filter((q) => q.id !== id) })),

      duplicateQuote: (id) => {
        const source = get().quotes.find((q) => q.id === id);
        if (!source) return null;
        const now = new Date().toISOString();
        const sequence = get().nextQuoteSequence;
        const projectTitle = `${source.projectTitle} (Copy)`;
        const copy = {
          ...source,
          id: generateQuoteId(),
          quoteNumber: formatQuoteNumber(sequence),
          projectTitle,
          status: "draft",
          createdAt: now,
          updatedAt: now,
          draft: { ...source.draft, projectTitle },
        };
        set((s) => ({
          quotes: [copy, ...s.quotes],
          nextQuoteSequence: s.nextQuoteSequence + 1,
        }));
        return copy;
      },
    }),
    {
      name: "quoterate.quotes",
      storage: createJSONStorage(() => safeLocalStorage),
    },
  ),
);
