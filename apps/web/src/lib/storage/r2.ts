import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface StorageUploadResult {
  key: string;
  url: string;
  bucket: string;
  size: number;
}

export class R2StorageService {
  private client: S3Client | null = null;
  private bucket: string;
  private publicDomain?: string;

  constructor() {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    this.bucket = process.env.R2_BUCKET_NAME || 'saarthi-documents';
    this.publicDomain = process.env.R2_PUBLIC_DOMAIN;

    if (accountId && accessKeyId && secretAccessKey) {
      this.client = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    }
  }

  public isConfigured(): boolean {
    return this.client !== null;
  }

  /**
   * Directly upload a file buffer / Uint8Array to Cloudflare R2
   */
  async uploadFile(
    key: string,
    body: Buffer | Uint8Array,
    contentType: string = 'application/octet-stream'
  ): Promise<StorageUploadResult> {
    if (!this.client) {
      throw new Error('Cloudflare R2 is not configured. Missing R2 environment credentials.');
    }

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    });

    await this.client.send(command);

    const publicUrl = this.publicDomain
      ? `${this.publicDomain}/${key}`
      : `https://${this.bucket}.${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;

    return {
      key,
      url: publicUrl,
      bucket: this.bucket,
      size: body.byteLength,
    };
  }

  /**
   * Generate a presigned upload URL for direct browser-to-R2 uploads
   */
  async getPresignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn: number = 3600
  ): Promise<string> {
    if (!this.client) {
      throw new Error('Cloudflare R2 is not configured.');
    }

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    return getSignedUrl(this.client, command, { expiresIn });
  }

  /**
   * Generate a presigned secure download URL for viewing private notices/documents
   */
  async getPresignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (!this.client) {
      throw new Error('Cloudflare R2 is not configured.');
    }

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn });
  }

  /**
   * Delete an object from Cloudflare R2
   */
  async deleteFile(key: string): Promise<void> {
    if (!this.client) {
      throw new Error('Cloudflare R2 is not configured.');
    }

    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
  }
}

export const r2Storage = new R2StorageService();
