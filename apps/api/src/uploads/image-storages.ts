import {
  COMPANY_LOGO_PUBLIC_PREFIX,
  DRIVER_IMAGE_PUBLIC_PREFIX,
} from './image-upload.constants';
import { createImageStorage } from './image-storage';

export const companyLogoStorage = createImageStorage({
  folderName: 'company-logos',
  publicPrefix: COMPANY_LOGO_PUBLIC_PREFIX,
  invalidMessage: 'Logo must be a PNG, JPG, WEBP, GIF, or SVG image',
});

export const driverImageStorage = createImageStorage({
  folderName: 'driver-images',
  publicPrefix: DRIVER_IMAGE_PUBLIC_PREFIX,
  invalidMessage: 'Image must be a PNG, JPG, WEBP, GIF, or SVG file',
});
