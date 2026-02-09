import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage for bank logos
const bankStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bank-logos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});

// Configure storage for airline logos
const airlineStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'airline-logos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});

// Configure storage for profile logos
const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profile-logos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});

// Default storage (can be used for both)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});

const upload = multer({ storage: storage });
const uploadBankLogo = multer({ storage: bankStorage });
const uploadAirlineLogo = multer({ storage: airlineStorage });
const uploadProfileLogo = multer({ storage: profileStorage });

export { cloudinary, upload, uploadBankLogo, uploadAirlineLogo, uploadProfileLogo };
