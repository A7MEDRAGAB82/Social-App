import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../../config/env.service";
import { BadRequestException } from "../exceptions/application.exception";

export type ProfileImageFolder = "profile-pictures" | "cover-pictures";

export interface UploadToS3Params {
  buffer: Buffer;
  key: string;
  contentType: string;
}

export interface PresignedUploadResult {
  uploadUrl: string;
  key: string;
  publicUrl: string;
  expiresIn: number;
}

export interface PresignedUploadParams {
  key: string;
  contentType: string;
  expiresIn?: number;
}

export class S3Service {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor() {
    this.client = new S3Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });
    this.bucket = env.AWS_S3_BUCKET_NAME;
  }

  buildUserImageKey(
    userId: string,
    folder: ProfileImageFolder,
    originalName: string
  ): string {
    const safeName = originalName.replace(/[^\w.-]/g, "_");
    return `users/${userId}/${folder}/${Date.now()}-${safeName}`;
  }

  assertUserImageKey(
    userId: string,
    key: string,
    folder: ProfileImageFolder
  ): void {
    const expectedPrefix = `users/${userId}/${folder}/`;

    if (!key.startsWith(expectedPrefix)) {
      throw new BadRequestException("Invalid image key for this user");
    }
  }

  getPublicUrl(key: string): string {
    if (env.AWS_S3_BASE_URL) {
      return `${env.AWS_S3_BASE_URL.replace(/\/$/, "")}/${key}`;
    }
    return `https://${this.bucket}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
  }

  async getPresignedUploadUrl({
    key,
    contentType,
    expiresIn = env.AWS_S3_PRESIGN_EXPIRES_IN,
  }: PresignedUploadParams): Promise<PresignedUploadResult> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn });

    return {
      uploadUrl,
      key,
      publicUrl: this.getPublicUrl(key),
      expiresIn,
    };
  }

  async upload({
    buffer,
    key,
    contentType,
  }: UploadToS3Params): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    );

    return this.getPublicUrl(key);
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
    );
  }
}

export const s3Service = new S3Service();
