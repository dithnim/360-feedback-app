// Cloudinary service for image uploads
// Note: You'll need to set up your Cloudinary account and get these values
// 1. Go to https://cloudinary.com and create a free account
// 2. Get your cloud name from the dashboard
// 3. Set up an unsigned upload preset in your Cloudinary settings
// 4. Copy .env.example to .env and fill in your credentials

const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1";

// Get credentials from environment variables
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  resource_type: string;
  bytes: number;
  width?: number;
  height?: number;
}

export const uploadImageToCloudinary = async (
  file: File
): Promise<CloudinaryUploadResponse> => {
  // Check if required environment variables are set
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary configuration missing. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your .env file"
    );
  }

  try {
    // Create FormData for the upload
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", "company-logos"); // Optional: organize uploads in folders

    // Upload to Cloudinary
    const response = await fetch(
      `${CLOUDINARY_UPLOAD_URL}/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw error;
  }
};

export const validateImageFile = (
  file: File
): { isValid: boolean; error?: string } => {
  // Check file type
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Please select a valid image file (JPEG, PNG, GIF, or WebP)",
    };
  }

  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "File size must be less than 5MB",
    };
  }

  return { isValid: true };
};

// Helper function to get optimized image URL
export const getOptimizedImageUrl = (
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
  }
): string => {
  if (!CLOUD_NAME) {
    throw new Error("VITE_CLOUDINARY_CLOUD_NAME is not configured");
  }

  const { width, height, quality = "auto", format = "auto" } = options || {};

  let transformations = `f_${format},q_${quality}`;

  if (width || height) {
    transformations += `,c_fit`;
    if (width) transformations += `,w_${width}`;
    if (height) transformations += `,h_${height}`;
  }

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformations}/${publicId}`;
};
