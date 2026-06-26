import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSession } from "@/server/services/auth-service";

// Inisialisasi S3 client untuk MinIO
const s3Client = new S3Client({
  region: process.env.S3_REGION || "us-east-1", // Default region untuk MinIO biasanya us-east-1
  endpoint: process.env.S3_ENDPOINT, // e.g., https://kendariweb-minio.q00ohl.easypanel.host atau http://kendariweb-minio:9000
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "",
    secretAccessKey: process.env.S3_SECRET_KEY || "",
  },
  forcePathStyle: true, // WAJIB untuk MinIO agar bucket ada di path (bukan subdomain)
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Buat nama file unik
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const originalName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const fileExtension = originalName.split(".").pop();
    const filename = `${uniqueSuffix}.${fileExtension}`;
    
    // Gunakan bucket dari env atau default ke 'menuqr'
    const bucketName = process.env.S3_BUCKET_NAME || "menuqr";
    const objectKey = `uploads/${filename}`;

    // Upload ke MinIO
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        Body: buffer,
        ContentType: file.type,
      })
    );

    // URL yang akan disimpan ke database
    // Jika S3_PUBLIC_URL di-set, gunakan itu. Jika tidak, pakai S3_ENDPOINT/bucket
    const publicUrlBase = process.env.S3_PUBLIC_URL || `${process.env.S3_ENDPOINT}/${bucketName}`;
    const fileUrl = `${publicUrlBase}/${objectKey}`;

    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
