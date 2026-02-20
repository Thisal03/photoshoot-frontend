import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
    region: process.env.AWS_REG || "eu-north-1",
    credentials: {
        accessKeyId: process.env.AWS_ID || "",
        secretAccessKey: process.env.AWS_KEY || "",
    },
});

export async function POST(req: NextRequest) {
    try {
        const { fileName, fileType, folder } = await req.json();

        if (!fileName || !fileType) {
            return NextResponse.json({ error: "Filename and fileType are required" }, { status: 400 });
        }

        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 8);
        const extension = fileName.split('.').pop() || 'jpg';
        const key = `generated-images/${folder || 'uploads'}/photoshoot_${timestamp}_${randomId}.${extension}`;

        const command = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
            ContentType: fileType,
        });

        // Generate the presigned URL - valid for 5 minutes
        const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

        const cloudfrontDomain = process.env.CLOUDFRONT_DOMAIN;
        const finalUrl = cloudfrontDomain
            ? `https://${cloudfrontDomain}/${key}`
            : `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REG || "eu-north-1"}.amazonaws.com/${key}`;

        return NextResponse.json({
            success: true,
            uploadUrl,
            finalUrl
        });
    } catch (error: any) {
        console.error("Presigned URL Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
