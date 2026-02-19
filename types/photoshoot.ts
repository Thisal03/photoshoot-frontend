export type ItemType =
    | "Face (5 Angles) & Body"
    | "Face & Body"
    | "Hair"
    | "Pose"
    | "Dress"
    | "Top"
    | "Bottom"
    | "Jacket"
    | "Coat"
    | "Shirt"
    | "Pants"
    | "Skirt"
    | "Sweater"
    | "Shoes"
    | "Necklace"
    | "Earrings"
    | "Ring"
    | "Bracelet"
    | "Watch"
    | "Belt"
    | "Bag"
    | "Hat"
    | "Scarf"
    | "Sunglasses"
    | "Background"
    | "Aesthetic"
    | "Framing"
    | "Lighting"
    | "Shadows"
    | "Theme"
    | "Other";

export interface PhotoshootItem {
    id: string;
    type: ItemType;
    text: string;
    strength?: number;
    reference_image_url?: string;
    reference_image_urls?: string[]; // For multi-angle
    reference_image?: string;
    reference_images?: string[];
}

export interface PhotoshootConfig {
    meta: {
        job_id: string;
    };
    model: PhotoshootItem[];
    outfits: PhotoshootItem[];
    accessories: PhotoshootItem[];
    environment: PhotoshootItem[];
    output: {
        count: number;
        batch_variety: "subtle_variations" | "dynamic_angles";
        quality: "1K" | "2K" | "4K";
        aspect_ratio: string;
        platform_preset: string;
    };
}
