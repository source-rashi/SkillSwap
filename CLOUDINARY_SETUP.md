# Cloudinary Setup Guide

## Getting Started with Cloudinary for Profile Pictures

### 1. Create a Cloudinary Account
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Once logged in, note your **Cloud Name** from the dashboard

### 2. Create an Upload Preset
1. In your Cloudinary dashboard, go to **Settings** > **Upload**
2. Scroll down to **Upload presets**
3. Click **Add upload preset**
4. Configure the preset:
   - **Upload preset name**: `skill-swap-profiles` (or any name you prefer)
   - **Signing Mode**: `Unsigned` (for client-side uploads)
   - **Folder**: `skill-swap/profiles` (optional, for organization)
   - **Format**: `Auto`
   - **Quality**: `Auto`
   - **Resource Type**: `Image`
   - **Image and video transformation**:
     - **Width**: `300`
     - **Height**: `300`
     - **Crop**: `Fill`
     - **Gravity**: `Face` (for better profile pictures)
5. Click **Save**

### 3. Update Environment Variables
Edit the file `client/.env` and replace the placeholder values:

```env
# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your_actual_cloud_name_here
VITE_CLOUDINARY_UPLOAD_PRESET=skill-swap-profiles
```

### 4. Restart the Development Server
After updating the environment variables, restart your Vite development server:

```bash
cd client
npm run dev
```

### 5. Test the Feature
1. Go to your profile page
2. Click on "Edit Profile"
3. Try uploading a profile picture using the drag-and-drop area
4. The image should upload to Cloudinary and display in your profile

## Features Included

✅ **Drag & Drop Upload**: Easy file selection with visual feedback
✅ **File Validation**: Automatic checking for file type and size
✅ **Image Preview**: See your image before uploading
✅ **Loading States**: Visual feedback during upload
✅ **Error Handling**: Clear error messages for upload issues
✅ **Fallback Avatars**: Professional default avatars when no image is set
✅ **Responsive Design**: Works on all screen sizes

## Troubleshooting

### Upload Preset Error
- Make sure the upload preset is set to "Unsigned"
- Verify the preset name matches exactly in your .env file

### CORS Errors
- Cloudinary typically allows client-side uploads by default
- If you encounter CORS issues, check your Cloudinary security settings

### File Size Limits
- The current limit is 5MB per image
- Cloudinary free accounts have a 10GB storage limit

### Environment Variables Not Loading
- Make sure the .env file is in the `client` folder
- Environment variables in Vite must start with `VITE_`
- Restart the development server after changes

## Security Notes

- Upload presets are set to "unsigned" for easy client-side uploads
- Consider implementing server-side uploads for production environments
- Monitor your Cloudinary usage to stay within free tier limits

## Next Steps

1. Set up your Cloudinary account
2. Create the upload preset
3. Update the environment variables
4. Test the profile picture functionality
5. Enjoy your enhanced skill swap platform! 🎉
