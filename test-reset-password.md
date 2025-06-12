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
- **Endpoint**: `PUT /v1/users/password`
- **Auth**: Required (Bearer token)
- **Body**: `{ "oldPassword": "string", "newPassword": "string" }`

### First-Time Password Setup
- **Endpoint**: `POST /v1/user-action/reset/{token}`
- **Auth**: Not required (public endpoint)
- **Body**: `{ "password": "string" }`

## Implementation Details

### User Hook Changes
- Added `setFirstTimePassword` mutation
- Added `isSettingFirstTimePassword` loading state
- First-time password mutation doesn't require authentication

### Reset Password Page Changes
- Detects first-time reset by checking URL pattern
- Conditionally shows/hides current password field
- Different UI text for first-time vs regular reset
- Different success redirect behavior
- Uses appropriate mutation based on reset type

## Testing Checklist

- [ ] First-time password URL detection works
- [ ] Current password field is hidden for first-time users
- [ ] UI text changes appropriately
- [ ] Form validation works for both scenarios
- [ ] API calls use correct endpoints
- [ ] Success redirects work correctly
- [ ] Error handling works for both scenarios
- [ ] Loading states work correctly
