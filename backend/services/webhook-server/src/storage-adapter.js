// storage-adapter.js
// Exports a Storage-like API: storage.bucket(name).file(filePath)
// Supports: GCS (using @google-cloud/storage) OR S3-compatible (MinIO etc).
// Choose backend via process.env.OBJECT_STORE = 'gcs' | 's3'

const { PassThrough } = require('stream');

const backend = (process.env.OBJECT_STORE || 'gcs').toLowerCase();

if (backend === 'gcs') {
  // Google Cloud Storage backend
  const { Storage } = require('@google-cloud/storage');
  const gcs = new Storage(); // respects GOOGLE_APPLICATION_CREDENTIALS etc.

  module.exports = {
    bucket: (bucketName) => {
      const gBucket = gcs.bucket(bucketName);
      return {
        file: (filePath) => {
          const gFile = gBucket.file(filePath);
          return {
            // buffer or string
            async save(bufOrStr, options = {}) {
              // GCS file.save
              return gFile.save(bufOrStr, options);
            },
            createWriteStream(options = {}) {
              return gFile.createWriteStream(options);
            },
            // returns Buffer
            async download() {
              const [data] = await gFile.download();
              return data;
            },
            async delete() {
              return gFile.delete();
            },
            // convenience: return a Readable stream
            createReadStream() {
              return gFile.createReadStream();
            },
            // expose underlying for anything else
            _underlying: gFile,
          };
        },
      };
    },
  };

} else {
  // S3-compatible backend (MinIO, LocalStack, SeaweedFS S3 gateway)
  const { S3Client, GetObjectCommand, DeleteObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
  const { Upload } = require('@aws-sdk/lib-storage');
  const streamToBuffer = async (stream) => {
    return new Promise((resolve, reject) => {
      const chunks = [];
      stream.on('data', (c) => chunks.push(c));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  };

  // MinIO / S3 client config via env vars:
  // S3_ENDPOINT, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_FORCE_PATH_STYLE (true/false)
  const s3Client = new S3Client({
    endpoint: process.env.S3_ENDPOINT || undefined,
    region: process.env.S3_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    },
    forcePathStyle: String(process.env.S3_FORCE_PATH_STYLE || 'true') === 'true', // MinIO requires path-style
  });

  module.exports = {
    bucket: (bucketName) => {
      return {
        file: (filePath) => {
          return {
            // Save a buffer/string directly
            async save(bufOrStr, options = {}) {
              const Body = Buffer.isBuffer(bufOrStr) ? bufOrStr : Buffer.from(String(bufOrStr));
              const params = {
                Bucket: bucketName,
                Key: filePath,
                Body,
                ContentType: options.contentType || 'application/octet-stream',
              };
              await s3Client.send(new PutObjectCommand(params));
            },
            // create a writable stream you can pipe into:
            createWriteStream(options = {}) {
              const pass = new PassThrough();
              // Use lib-storage Upload to stream to S3
              const uploader = new Upload({
                client: s3Client,
                params: {
                  Bucket: bucketName,
                  Key: filePath,
                  Body: pass,
                  ContentType: options.contentType || 'application/octet-stream',
                },
              });
              // start upload but don't await here. The stream user will end() it.
              uploader.done().catch((err) => {
                // If the consumer doesn't catch stream errors, emit them on pass-through so piping side sees it
                pass.emit('error', err);
              });
              return pass;
            },
            // Download to Buffer
            async download() {
              const get = await s3Client.send(new GetObjectCommand({
                Bucket: bucketName,
                Key: filePath,
              }));
              const bodyStream = get.Body; // Node readable stream
              return streamToBuffer(bodyStream);
            },
            async delete() {
              await s3Client.send(new DeleteObjectCommand({
                Bucket: bucketName,
                Key: filePath,
              }));
            },
            // basic read stream (for streaming downloads)
            async createReadStream() {
              const get = await s3Client.send(new GetObjectCommand({
                Bucket: bucketName,
                Key: filePath,
              }));
              return get.Body; // readable stream
            },
            _underlying: { s3Client, bucketName, key: filePath },
          };
        },
      };
    },
  };
}
