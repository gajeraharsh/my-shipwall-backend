import AWS, { S3 } from 'aws-sdk';

// Example config object; adjust to match your project’s config structure
// or read from process.env
const s3Config = {
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || 'YOUR_ACCESS_KEY',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || 'YOUR_SECRET_KEY',
  AWS_REGION: process.env.AWS_REGION || 'YOUR_REGION',
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || 'YOUR_BUCKET_NAME',
};

console.log(process.env.AWS_ACCESS_KEY_ID)
// Configure AWS
AWS.config.update({
  accessKeyId: s3Config.AWS_ACCESS_KEY_ID,
  secretAccessKey: s3Config.AWS_SECRET_ACCESS_KEY,
  region: s3Config.AWS_REGION,
});

const s3 = new S3();

export const uploadFileToS3 = async (
  file: Express.Multer.File,
  userId: string
): Promise<string> => {
  try {
    const params = {
      Bucket: s3Config.S3_BUCKET_NAME,
      Key: `${userId}/${Date.now()}_${file.originalname}`,
      Body: file.buffer,      // from multer.memoryStorage()
      ContentType: file.mimetype,
    };

    const data = await s3.upload(params).promise();
    console.log(`File uploaded successfully: ${data.Location}`);
    return data.Location;
  } catch (err) {
    console.error('Error uploading to S3:', err);
    throw err;
  }
};
