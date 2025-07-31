# Cloudinary Setup Guide

This guide will help you set up Cloudinary for image uploads in your application.

## Step 1: Create a Cloudinary Account

1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. After signup, you'll be taken to your dashboard

## Step 2: Get Your Cloud Name

1. On your Cloudinary dashboard, you'll see your **Cloud name** in the top section
2. Copy this value

## Step 3: Create an Upload Preset

1. In your Cloudinary dashboard, go to **Settings** (gear icon)
2. Click on **Upload** tab
3. Scroll down to **Upload presets**
4. Click **Add upload preset**
5. Set the following:
   - **Preset name**: Choose a name (e.g., `company_logos`)
   - **Signing Mode**: Select **Unsigned**
   - **Folder**: Set to `company-logos` (optional, for organization)
   - **Allowed formats**: jpg, png, gif, webp
   - **Transformation**: You can add transformations if needed
6. Click **Save**

## Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```env
   VITE_CLOUDINARY_CLOUD_NAME=your-actual-cloud-name
   VITE_CLOUDINARY_UPLOAD_PRESET=your-actual-upload-preset-name
   ```

## Step 5: Test the Upload

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Navigate to the company creation page (case 1)
3. Try uploading an image using the drag-and-drop area

## Free Tier Limits

Cloudinary's free tier includes:

- 25 GB storage
- 25 GB monthly bandwidth
- 1,000 transformations per month
- Basic image and video management

## Troubleshooting

### "Configuration missing" error

- Make sure your `.env` file exists and contains the correct values
- Restart your development server after adding environment variables

### "Upload failed" error

- Check that your upload preset is set to "Unsigned"
- Verify your cloud name is correct
- Check browser console for detailed error messages

### Images not displaying

- Verify the image URL is being saved correctly to your backend
- Check that the image was uploaded successfully to Cloudinary

## Alternative Free Services

If you prefer other services, here are alternatives:

1. **Firebase Storage** - Google's cloud storage
2. **Supabase Storage** - Open source Firebase alternative
3. **AWS S3** - Amazon's storage service (free tier available)
4. **ImageKit** - Image optimization and storage service

Would you like instructions for any of these alternatives?
