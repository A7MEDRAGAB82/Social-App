import multer from 'multer';
import path from 'path';
import { mkdirSync } from 'fs';
import { MulterEnum } from '../../enums/multer.enum';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

export const getPublicUploadPath = (file: Express.Multer.File): string =>
  path.posix.join('uploads', file.filename);

export const uploadFile = () => ({
  storageKey = MulterEnum.memoryStorage,
}: {
  storageKey?: MulterEnum;
}) => {
  const storage =
    storageKey === MulterEnum.diskStorage
      ? multer.diskStorage({
          destination(_req, _file, cb) {
            mkdirSync(UPLOADS_DIR, { recursive: true });
            cb(null, UPLOADS_DIR);
          },
          filename(_req, file, cb) {
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            cb(null, `${file.fieldname}-${uniqueSuffix}-${file.originalname}`);
          },
        })
      : multer.memoryStorage();

  return multer({ storage });
};


