export async function uploadToS3(
    file: File | Blob,
    folder: string,
    fileName?: string
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        const formData = new FormData();
        formData.append("file", file, fileName);
        formData.append("folder", folder);

        const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Upload failed");
        }

        const { url } = await response.json();
        return { success: true, url };
    } catch (error: any) {
        console.error("Upload Error:", error);
        return { success: false, error: error.message };
    }
}
