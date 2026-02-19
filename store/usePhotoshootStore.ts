import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { PhotoshootConfig, PhotoshootItem, ItemType } from '@/types/photoshoot';

interface PhotoshootState {
    config: PhotoshootConfig;
    addItem: (section: keyof Omit<PhotoshootConfig, 'meta' | 'output'>, item: Omit<PhotoshootItem, 'id'>) => void;
    removeItem: (section: keyof Omit<PhotoshootConfig, 'meta' | 'output'>, id: string) => void;
    updateOutput: (updates: Partial<PhotoshootConfig['output']>) => void;
    resetConfig: () => void;
}

const initialConfig: PhotoshootConfig = {
    meta: {
        job_id: `job_${uuidv4().split('-')[0]}`,
    },
    model: [],
    outfits: [],
    accessories: [],
    environment: [],
    output: {
        count: 2,
        batch_variety: 'subtle_variations',
        quality: '4K',
        aspect_ratio: '4:5',
        platform_preset: 'Instagram Portrait (4:5)',
    },
};

export const usePhotoshootStore = create<PhotoshootState>((set) => ({
    config: initialConfig,
    addItem: (section, item) =>
        set((state) => ({
            config: {
                ...state.config,
                [section]: [...state.config[section], { ...item, id: uuidv4() }],
            },
        })),
    removeItem: (section, id) =>
        set((state) => ({
            config: {
                ...state.config,
                [section]: state.config[section].filter((item) => item.id !== id),
            },
        })),
    updateOutput: (updates) =>
        set((state) => ({
            config: {
                ...state.config,
                output: { ...state.config.output, ...updates },
            },
        })),
    resetConfig: () => set({ config: { ...initialConfig, meta: { job_id: `job_${uuidv4().split('-')[0]}` } } }),
}));
