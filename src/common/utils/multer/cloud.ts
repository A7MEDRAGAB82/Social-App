import multer from 'multer';
import {tmpdir} from 'os';
import { MulterEnum } from '../../enums/multer.enum';

export const uploadFile = ()=>({
    storageKey = MulterEnum.memoryStorage
}:
  {
    storageKey?: MulterEnum
  } )=>{

  


   // const storage : multer.StorageEngine = multer.memoryStorage();

   const storage = storageKey === MulterEnum.diskStorage ? multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, tmpdir());
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
        }
    }) : multer.memoryStorage();
    

   
   return multer({ storage });
}


