export async function uploadToS3(
    file: File | Blob,
    folder: string,
    fileName?: string
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        // Step 1: Get presigned URL from our API
        const name = fileName || (file as File).name || `file_${Date.now()}`;
        const type = file.type || "image/jpeg";

        const presignedRes = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fileName: name,
                fileType: type,
                folder,
            }),
        });

        if (!presignedRes.ok) {
            const errorData = await presignedRes.json();
            throw new Error(errorData.error || "Failed to get upload permit");
        }

        const { uploadUrl, finalUrl } = await presignedRes.json();

        // Step 2: Upload directly to S3 using the presigned URL
        const uploadRes = await fetch(uploadUrl, {
            method: "PUT",
            body: file,
            headers: {
                "Content-Type": type,
            },
        });

        if (!uploadRes.ok) {
            throw new Error(`Cloud upload failed: ${uploadRes.statusText}`);
        }

        return { success: true, url: finalUrl };
    } catch (error: any) {
        console.error("Direct Upload Error:", error);
        return { success: false, error: error.message };
    }
}
