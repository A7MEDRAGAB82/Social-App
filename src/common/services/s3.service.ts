import {
  DeleteObjectCommand,
  GetObjectCommand,
  type GetObjectCommandOutput,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../../config/env.service";
import { Readable } from "node:stream";
import {
  BadRequestException,
  NotFoundException,
} from "../exceptions/application.exception";
import {
  UploadToS3Params,
  PresignedUploadParams,
  PresignedUploadResult,
  S3AssetResult,
} from "../interfaces/s3.interface";

export type ProfileImageFolder = "profile-pictures" | "cover-pictures";



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

  private async streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];

    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    return Buffer.concat(chunks);
  }

  private async bodyToBuffer(
    body: GetObjectCommandOutput["Body"]
  ): Promise<Buffer> {
    if (
      body &&
      typeof body === "object" &&
      "transformToByteArray" in body &&
      typeof body.transformToByteArray === "function"
    ) {
      const bytes = await body.transformToByteArray();
      return Buffer.from(bytes);
    }

    if (body instanceof Readable) {
      return this.streamToBuffer(body);
    }

    throw new BadRequestException("Unable to read asset from storage");
  }

  private isS3NotFoundError(error: unknown): boolean {
    return (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      (error.name === "NoSuchKey" || error.name === "NotFound")
    );
  }

  async getAsset(key: string): Promise<S3AssetResult> {
    if (!key?.trim()) {
      throw new BadRequestException("Asset key is required");
    }

    try {
      const response = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        })
      );

      if (!response.Body) {
        throw new NotFoundException("Asset not found");
      }

      const buffer = await this.bodyToBuffer(response.Body);

      const asset: S3AssetResult = { buffer };

      if (response.ContentType) {
        asset.contentType = response.ContentType;
      }
      if (response.ContentLength !== undefined) {
        asset.contentLength = response.ContentLength;
      }

      return asset;
    } catch (error) {
      if (this.isS3NotFoundError(error)) {
        throw new NotFoundException("Asset not found", error);
      }
      throw error;
    }
  }

  async getPresignedDownloadUrl(
    key: string,
    expiresIn = env.AWS_S3_PRESIGN_EXPIRES_IN
  ): Promise<{ downloadUrl: string; key: string; expiresIn: number }> {
    if (!key?.trim()) {
      throw new BadRequestException("Asset key is required");
    }

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const downloadUrl = await getSignedUrl(this.client, command, { expiresIn });

    return { downloadUrl, key, expiresIn };
  }
}

export const s3Service = new S3Service();
