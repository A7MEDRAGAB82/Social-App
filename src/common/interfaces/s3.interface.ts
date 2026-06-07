


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

export interface S3AssetResult {
  buffer: Buffer;
  contentType?: string;
  contentLength?: number;
}