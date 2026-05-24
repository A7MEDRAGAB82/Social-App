import { config } from "dotenv";
import  path  from "path";

config({ path: path.resolve(__dirname, `../.env.${process.env.NODE_ENV}`) });

const mongoURL = process.env.DATABASE_URI as string;
const mongoURL_PROD = process.env.DATABASE_URI_PROD as string;
const mood = process.env.MOOD as string;
const port = process.env.PORT as string;
const saltRounds = process.env.SALT as string;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY as string;
const JWT_REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET_KEY as string;
const ENC_KEY = process.env.ENC_KEY || "defaultKey";
const emailUser = process.env.EMAIL_USER as string;
const emailPassword = process.env.EMAIL_PASS as string;
const BASE_URL = process.env.BASE_URL || "http://localhost:3000"
const REDIS_URL = process.env.REDIS_URI || 'redis://localhost:6379';
const googleClientId = process.env.GOOGLE_CLIENT_ID as string;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET as string;
const AWS_REGION = process.env.AWS_REGION as string;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID as string;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY as string;
const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME as string;
const AWS_S3_BASE_URL = process.env.AWS_S3_BASE_URL as string | undefined;
const AWS_S3_PRESIGN_EXPIRES_IN = Number(
  process.env.AWS_S3_PRESIGN_EXPIRES_IN ?? 900
);


export const env = {
  port,
  mongoURL,
  mood,
  saltRounds,
  JWT_SECRET_KEY,
  JWT_REFRESH_SECRET_KEY,
  ENC_KEY,
  emailUser,
  emailPassword,
  BASE_URL,
  REDIS_URL,
  googleClientId,
  googleClientSecret,
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET_NAME,
  AWS_S3_BASE_URL,
  AWS_S3_PRESIGN_EXPIRES_IN,
};