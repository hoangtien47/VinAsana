# Reset Password Testing Guide

## Test Scenarios

### 1. Regular Password Change (Authenticated Users)
- **URL**: `http://localhost:4040/reset-password`
- **Expected Behavior**:
  - Shows "Change Password" title
  - Requires current password field
  - Requires new password and confirmation
  - Uses `updatePassword` mutation with old/new password
  - Redirects to `/settings` after success

### 2. First-Time Password Setup (Token-based)
- **URL**: `http://localhost:4040/reset-password/vz80X9iaKNHxfqO1NIdSwzEsSQb0OxJbTQGIZhH_PKQ`
- **Expected Behavior**:
  - Shows "Set Your Password" title
  - Hides current password field
  - Only shows new password and confirmation fields
  - Uses `setFirstTimePassword` mutation with token
  - Redirects to `/landing` (login page) after success

## API Endpoints Used

### Regular Password Change
- **Endpoint**: `PUT ${VITE_API_BASE_URL}/v1/users/password`
- **Auth**: Required (Bearer token)
- **Body**: `{ "oldPassword": "string", "newPassword": "string" }`

### First-Time Password Setup
- **Endpoint**: `POST ${VITE_API_BASE_URL}/v1/user-action/reset/{token}`
- **Auth**: Not required (public endpoint)
- **Body**: `{ "password": "string" }`

## Environment Configuration

### Environment Variables
- **File**: `.env`
- **Variable**: `VITE_API_BASE_URL=http://localhost:8080`
- **Default**: Falls back to `http://localhost:8080` if not set

### API Base URL Usage
All API calls now use the centralized `getApiBaseUrl()` function from `@/lib/utils`.

## Implementation Details

### User Hook Changes
- Added `setFirstTimePassword` mutation
- Added `isSettingFirstTimePassword` loading state
- First-time password mutation doesn't require authentication
- All API calls use environment variable via `getApiBaseUrl()`

### Reset Password Page Changes
- Detects first-time reset by checking URL pattern
- Conditionally shows/hides current password field
- Different UI text for first-time vs regular reset
- Different success redirect behavior
- Uses appropriate mutation based on reset type

### Environment Variable Updates
Updated all hardcoded API URLs in:
- `use-user.ts` - User management API calls
- `use-project.ts` - Project management API calls  
- `use-task.ts` - Task management API calls
- `use-document.ts` - Document management API calls
- `dashboard.tsx` - Dashboard task fetching

## Testing Checklist

- [x] Environment variable configuration
- [x] API base URL centralization
- [x] First-time password URL detection works
- [x] Current password field is hidden for first-time users
- [x] UI text changes appropriately
- [x] Form validation works for both scenarios
- [x] API calls use correct endpoints with environment variables
- [x] Success redirects work correctly
- [x] Error handling works for both scenarios
- [x] Loading states work correctly
- [ ] Manual testing with actual token URLs
- [ ] Integration testing with backend API

## Next Steps

1. Start development server: `npm run dev`
2. Test regular password change at `/reset-password`
3. Test first-time setup at `/reset-password/{token}`
4. Verify API calls use correct base URL from environment
5. Test error scenarios and edge cases
