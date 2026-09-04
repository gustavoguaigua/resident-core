import {
  CopyObjectCommand,
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import type { DocumentStorageConfig } from "./document-storage.config.js";
import type {
  DocumentStoragePort,
  StoredObject,
} from "./secure-document-storage.contract.js";

export class S3DocumentStorageAdapter implements DocumentStoragePort {
  private readonly client: S3Client;

  public constructor(private readonly config: DocumentStorageConfig) {
    this.client = new S3Client({
      region: config.region,
      ...(config.endpoint === undefined ? {} : { endpoint: config.endpoint }),
      forcePathStyle: config.forcePathStyle,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  public async ensurePrivateBucket(): Promise<void> {
    try {
      await this.client.send(
        new HeadBucketCommand({ Bucket: this.config.bucket }),
      );
    } catch {
      await this.client.send(
        new CreateBucketCommand({ Bucket: this.config.bucket }),
      );
    }
  }

  public async writeTemporary(
    tenantId: string,
    uploadId: string,
    body: Uint8Array,
  ): Promise<string> {
    const key = `${tenantId}/temporary/${uploadId}`;
    await this.put(key, body);
    return key;
  }

  public async promote(
    temporaryKey: string,
    tenantId: string,
    objectId: string,
  ): Promise<string> {
    const key = `${tenantId}/objects/${objectId}`;
    await this.client.send(
      new CopyObjectCommand({
        Bucket: this.config.bucket,
        CopySource: `${this.config.bucket}/${temporaryKey}`,
        Key: key,
        ...(this.config.serverSideEncryption === undefined
          ? {}
          : { ServerSideEncryption: this.config.serverSideEncryption }),
      }),
    );
    await this.delete(temporaryKey);
    return key;
  }

  public async read(key: string): Promise<Uint8Array> {
    const result = await this.client.send(
      new GetObjectCommand({ Bucket: this.config.bucket, Key: key }),
    );
    if (result.Body === undefined)
      throw new Error("Stored object has no body.");
    return result.Body.transformToByteArray();
  }

  public async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.config.bucket, Key: key }),
    );
  }

  public async listTenantObjects(
    tenantId: string,
  ): Promise<readonly StoredObject[]> {
    const result = await this.client.send(
      new ListObjectsV2Command({
        Bucket: this.config.bucket,
        Prefix: `${tenantId}/`,
      }),
    );
    return (result.Contents ?? []).flatMap((item) =>
      item.Key === undefined || item.LastModified === undefined
        ? []
        : [{ key: item.Key, lastModified: item.LastModified }],
    );
  }

  private async put(key: string, body: Uint8Array): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        Body: body,
        ...(this.config.serverSideEncryption === undefined
          ? {}
          : { ServerSideEncryption: this.config.serverSideEncryption }),
      }),
    );
  }
}
