import { PhotoshootConfig, PhotoshootItem } from '@/types/photoshoot';

export async function quickUpdate(payload: {
    prompt: string;
    image_urls?: string[];
    aspect_ratio?: string;
    resolution?: string;
}): Promise<{ success: boolean; image?: string; error?: string }> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_FLASK_API_URL || '';
        const endpoint = baseUrl.endsWith('/') ? `${baseUrl}quick-update` : `${baseUrl}/quick-update`;

        process.env.NODE_ENV === 'development' && console.log(`[API] Fetching from: ${endpoint}`);

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Flask Backend Error: ${errorText}`);
        }

        const result = await response.json();

        if (result.status === 'success' && result.data?.image) {
            return { success: true, image: result.data.image };
        } else {
            return { success: false, error: result.message || "Quick update failed" };
        }
    } catch (error: any) {
        console.error("Quick Update Error:", error);
        return { success: false, error: error.message };
    }
}

export async function generatePhotoshoot(config: PhotoshootConfig): Promise<{ success: boolean; images?: string[]; error?: string }> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_FLASK_API_URL || '';
        const endpoint = baseUrl.endsWith('/') ? `${baseUrl}generate` : `${baseUrl}/generate`;

        process.env.NODE_ENV === 'development' && console.log(`[API] Fetching from: ${endpoint}`);

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(transformConfigToPayload(config)),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Flask Backend Error: ${errorText}`);
        }

        const result = await response.json();

        if (result.status === 'success' && result.data?.images) {
            return { success: true, images: result.data.images };
        } else {
            return { success: false, error: result.message || "Generation failed" };
        }
    } catch (error: any) {
        console.error("Generation Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Transforms the internal store config to the structure expected by the Supabase Edge Function.
 * The Edge Function expects model, outfits, accessories, and environment items to have
 * reference_images and reference_image_urls (which it later cleans for Gemini).
 */
function transformConfigToPayload(config: PhotoshootConfig) {
    const payload = JSON.parse(JSON.stringify(config));
    let imageCounter = 1;

    // Add the ATTACHED IMAGE N references that the Edge Function uses to build the mapping
    const sections = ['model', 'outfits', 'accessories', 'environment'] as const;

    sections.forEach(section => {
        payload[section] = payload[section].map((item: PhotoshootItem) => {
            const newItem = { ...item };

            if (item.type === 'Face (5 Angles) & Body' && item.reference_image_urls) {
                newItem.reference_images = item.reference_image_urls.map(() => `ATTACHED IMAGE ${imageCounter++}`);
                // reference_image_urls remains as is for the Edge Function to build the mapping
            } else if (item.reference_image_url) {
                newItem.reference_image = `ATTACHED IMAGE ${imageCounter++}`;
                newItem.reference_image_urls = [item.reference_image_url];
            }

            return newItem;
        });
    });

    return payload;
}
