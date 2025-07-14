# Avatar Upload & Management System

## Overview

The Avatar Upload & Management system provides comprehensive functionality for users to upload, manage, and display profile pictures in BuyMartV1. The system includes image processing, storage management, and a user-friendly interface.

## Features

### ✅ Core Functionality
- **File Upload**: Support for JPEG, PNG, and WebP formats
- **Image Processing**: Automatic resizing, cropping, and compression
- **Storage Management**: Secure cloud storage with Supabase
- **Preview System**: Real-time preview before upload
- **Progress Tracking**: Visual upload progress indicators
- **Error Handling**: Comprehensive validation and error messages

### ✅ User Interface
- **Drag & Drop**: Intuitive drag and drop upload
- **Modal Interface**: Professional upload modal with preview
- **Responsive Design**: Works on all device sizes
- **Visual Feedback**: Hover effects and loading states
- **Management Controls**: Upload, remove, and replace options

### ✅ Technical Features
- **Image Optimization**: Automatic compression to 85% quality
- **Size Limits**: 5MB maximum file size
- **Format Validation**: Strict file type checking
- **Security**: Row Level Security (RLS) policies
- **Performance**: Optimized image processing and storage

## File Structure

```
src/features/user-profile/services/
├── avatar.service.js          # Avatar management service (standalone)

dashboard/
├── user-profile.html          # Main profile page with avatar functionality
├── avatar-test.html           # Testing page for avatar features

scripts/
├── setup-avatar-storage.sql   # Database setup script

docs/
├── avatar-management.md       # This documentation file
```

## Implementation Details

### Avatar Manager Class

The `AvatarManager` class handles all avatar-related functionality:

```javascript
class AvatarManager {
    constructor() {
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        this.bucketName = 'avatars';
    }
}
```

### Key Methods

1. **File Validation**
   - Size checking (max 5MB)
   - Format validation (JPEG, PNG, WebP)
   - Error reporting

2. **Image Processing**
   - Automatic center cropping to square format
   - Resizing to maximum 400x400 pixels
   - JPEG compression at 85% quality

3. **Upload Management**
   - Unique filename generation
   - Supabase Storage integration
   - Progress tracking
   - Error handling

4. **UI Integration**
   - Modal interface
   - Drag and drop support
   - Preview functionality
   - Progress indicators

### Storage Structure

Avatars are stored in Supabase Storage with the following structure:

```
avatars/
├── {user_id}/
│   ├── avatar_1234567890.jpg
│   ├── avatar_1234567891.jpg
│   └── ...
```

### Database Schema

The `profiles` table includes an `avatar_url` column:

```sql
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;
```

## Usage

### Basic Upload

1. User clicks on avatar area or upload button
2. Modal opens with upload interface
3. User selects file or drags & drops
4. System validates and shows preview
5. User confirms upload
6. Image is processed and uploaded
7. Profile is updated with new avatar URL

### File Management

- **Upload**: Click avatar area or "Upload Photo" button
- **Remove**: Click "Remove" button to delete current avatar
- **Replace**: Upload new image to replace existing avatar

### Drag & Drop

Users can drag image files directly onto:
- The avatar area in the profile
- The upload area in the modal

## API Integration

### Supabase Storage

The system uses Supabase Storage with the following configuration:

```javascript
// Upload file
const { data, error } = await supabaseClient.storage
    .from('avatars')
    .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
    });

// Get public URL
const { data: urlData } = supabaseClient.storage
    .from('avatars')
    .getPublicUrl(fileName);
```

### Database Updates

Profile updates are handled through the `profiles` table:

```javascript
await supabaseClient
    .from('profiles')
    .update({ 
        avatar_url: avatarUrl, 
        updated_at: new Date().toISOString() 
    })
    .eq('user_id', userId);
```

## Security

### Row Level Security (RLS)

The system implements comprehensive RLS policies:

1. **Upload Policy**: Users can only upload to their own folder
2. **Update Policy**: Users can only update their own avatars
3. **Delete Policy**: Users can only delete their own avatars
4. **Read Policy**: Public read access for all avatars

### File Validation

- File type checking using MIME types
- File size limits (5MB maximum)
- Image format validation
- Malicious file detection

## Testing

### Test Pages

1. **Avatar Test Page**: `dashboard/avatar-test.html`
   - Authentication testing
   - Storage access verification
   - Upload functionality testing
   - File handling validation

2. **Profile Integration**: `dashboard/user-profile.html`
   - Full avatar management interface
   - Real-world usage testing
   - UI/UX validation

### Test Scenarios

1. **File Upload**
   - Valid image files (JPEG, PNG, WebP)
   - Invalid file types
   - Oversized files
   - Corrupted files

2. **Image Processing**
   - Various image dimensions
   - Different aspect ratios
   - Quality compression
   - Format conversion

3. **Storage Management**
   - Upload success/failure
   - File replacement
   - Deletion functionality
   - URL generation

## Browser Support

- **Modern Browsers**: Full functionality
- **File API**: Required for file handling
- **Canvas API**: Required for image processing
- **Drag & Drop API**: Enhanced user experience

## Performance Considerations

1. **Image Compression**: Reduces file sizes by ~70%
2. **Lazy Loading**: Avatars load on demand
3. **Caching**: Browser and CDN caching enabled
4. **Optimization**: Minimal DOM manipulation

## Error Handling

The system provides comprehensive error handling:

- **File Validation Errors**: Clear user messages
- **Upload Failures**: Retry mechanisms
- **Network Issues**: Graceful degradation
- **Storage Errors**: Fallback options

## Future Enhancements

Potential improvements for future versions:

1. **Advanced Cropping**: Manual crop selection
2. **Filters**: Image filters and effects
3. **Multiple Formats**: Additional image formats
4. **Batch Upload**: Multiple image selection
5. **AI Enhancement**: Automatic image enhancement

## Troubleshooting

### Common Issues

1. **Upload Fails**: Check file size and format
2. **Preview Not Showing**: Verify browser support
3. **Storage Errors**: Check Supabase configuration
4. **Permission Denied**: Verify RLS policies

### Debug Tools

- Browser Developer Tools
- Supabase Dashboard
- Avatar Test Page
- Console Logging

## Conclusion

The Avatar Upload & Management system provides a comprehensive, secure, and user-friendly solution for profile picture management in BuyMartV1. The system is designed for scalability, performance, and ease of use while maintaining high security standards.
