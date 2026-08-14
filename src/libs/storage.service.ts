import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Storage as GCSStorage } from '@google-cloud/storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { StorageType, UploadOptions, UploadResult } from '../types/storage';
import { processImage } from '../utils/imageOptimizer';
import { Env } from '../config/Env';

export class StorageService {
  private storageType: StorageType;

  // Driver Clients
  private s3Client?: S3Client;
  private gcsClient?: GCSStorage;
  private supabaseClient?: SupabaseClient;

  constructor() {
    this.storageType = (Env.STORAGE_TYPE as StorageType) || 'local';
    this.initDriver();
  }

  private initDriver() {
    switch (this.storageType) {
      case 's3':
        this.s3Client = new S3Client({
          region: Env.S3_REGION || 'us-east-1',
          endpoint: Env.S3_ENDPOINT,
          credentials: {
            accessKeyId: Env.S3_ACCESS_KEY || '',
            secretAccessKey: Env.S3_SECRET_KEY || '',
          },
          forcePathStyle: true, // Wajib true untuk MinIO
        });
        break;

      case 'gcs':
        this.gcsClient = new GCSStorage({
          keyFilename: Env.GCS_KEY_FILE_PATH,
          projectId: Env.GCS_PROJECT_ID,
        });
        break;

      case 'supabase':
        this.supabaseClient = createClient(
          Env.SUPABASE_URL || '',
          Env.SUPABASE_SERVICE_ROLE_KEY || ''
        );
        break;

      case 'local':
      default:
        break;
    }
  }

  /**
   * Main Method: Upload File
   */
  async upload(
    fileBuffer: Buffer,
    originalMimeType: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    // 1. Process & Optimize Image (Convert to WebP except GIF)
    const { buffer, mimetype, extension } = await processImage(fileBuffer, originalMimeType);

    // 2. Generate Unique Filename & Path
    const folder = options.folder ? `${options.folder}/` : '';
    const filename = `${crypto.randomUUID()}.${extension}`;
    const key = `${folder}${filename}`;

    // 3. Forward to Selected Storage Driver
    switch (this.storageType) {
      case 's3':
        return this.uploadToS3(key, buffer, mimetype);
      case 'gcs':
        return this.uploadToGCS(key, buffer, mimetype);
      case 'supabase':
        return this.uploadToSupabase(key, buffer, mimetype);
      case 'local':
      default:
        return this.uploadToLocal(key, buffer, mimetype);
    }
  }

  /**
   * Main Method: Delete File
   */
  async delete(key: string): Promise<boolean> {
    try {
      switch (this.storageType) {
        case 's3':
          await this.s3Client!.send(
            new DeleteObjectCommand({
              Bucket: Env.S3_BUCKET_NAME!,
              Key: key,
            })
          );
          return true;

        case 'gcs':
          await this.gcsClient!.bucket(Env.GCS_BUCKET_NAME!).file(key).delete();
          return true;

        case 'supabase':
          await this.supabaseClient!.storage.from(Env.SUPABASE_BUCKET_NAME!).remove([key]);
          return true;

        case 'local':
        default:
          const uploadDir = Env.LOCAL_UPLOAD_DIR || 'public/uploads';
          const filePath = path.join(process.cwd(), uploadDir, key);
          await fs.unlink(filePath).catch(() => null);
          return true;
      }
    } catch (error) {
      console.error(`Failed to delete file (${key}):`, error);
      return false;
    }
  }

  // --- PRIVATE DRIVER IMPLEMENTATIONS ---

  private async uploadToLocal(key: string, buffer: Buffer, mimetype: string): Promise<UploadResult> {
    const baseDir = Env.LOCAL_UPLOAD_DIR || 'public/uploads';
    const uploadDir = path.join(process.cwd(), baseDir, path.dirname(key));

    await fs.mkdir(uploadDir, { recursive: true });

    const fullPath = path.join(process.cwd(), baseDir, key);
    await fs.writeFile(fullPath, buffer);

    const baseUrl = Env.APP_URL || 'http://localhost:3000';
    const cleanKey = key.replace(/\\/g, '/');

    return {
      url: `${baseUrl}/uploads/${cleanKey}`,
      key: cleanKey,
      provider: "LOCAL",
      mimetype,
    };
  }

  private async uploadToS3(key: string, buffer: Buffer, mimetype: string): Promise<UploadResult> {
    const bucket = Env.S3_BUCKET_NAME!;

    await this.s3Client!.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
      })
    );

    const baseUrl = Env.S3_PUBLIC_URL || `${Env.S3_ENDPOINT}/${bucket}`;
    return {
      url: `${baseUrl}/${key}`,
      key,
      mimetype,
      provider: "S3",
    };
  }

  private async uploadToGCS(key: string, buffer: Buffer, mimetype: string): Promise<UploadResult> {
    const bucketName = Env.GCS_BUCKET_NAME!;
    const bucket = this.gcsClient!.bucket(bucketName);
    const file = bucket.file(key);

    await file.save(buffer, { contentType: mimetype });

    return {
      url: `${Env.GCS_BASE_URL}/${bucketName}/${key}`,
      key,
      mimetype,
      provider: "GCS",
    };
  }

  private async uploadToSupabase(key: string, buffer: Buffer, mimetype: string): Promise<UploadResult> {
    const bucket = Env.SUPABASE_BUCKET_NAME!;

    const { error } = await this.supabaseClient!.storage.from(bucket).upload(key, buffer, {
      contentType: mimetype,
      upsert: true,
    });

    if (error) throw new Error(`Supabase Upload Error: ${error.message}`);

    const { data } = this.supabaseClient!.storage.from(bucket).getPublicUrl(key);

    return {
      url: data.publicUrl,
      key,
      mimetype,
      provider: "SUPABASE",
    };
  }
}

export const storageService = new StorageService();