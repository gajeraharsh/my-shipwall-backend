import AWS from "aws-sdk";
import { UploadedFile } from "express-fileupload";

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

export const uploadFileToS3 = async (file: UploadedFile, userId: string): Promise<string> => {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: `${userId}/${Date.now()}_${file.name}`, 
      Body: file.data,
      ContentType: file.mimetype,
    };

    const data = await s3.upload(params).promise();
    console.log(`File uploaded successfully: ${data.Location}`);

    return data.Location;
  } catch (err) {
    console.error("Error uploading to S3", err);
    throw err;
  }
};
