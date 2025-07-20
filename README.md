# 360 Feedback App

A React-based 360-degree feedback application with JWT authentication.

## JWT Authentication & Persistence

The application now properly handles JWT token persistence across page reloads. Here's how it works:

### Key Features

1. **Token Storage**: JWT tokens are stored in `localStorage` instead of `sessionStorage` to persist across browser sessions and page reloads.

2. **Automatic Token Validation**: The app automatically validates tokens on startup and checks for expiration.

3. **User State Persistence**: User information is automatically restored from the stored token when the app loads.

4. **Automatic Logout**: Expired or invalid tokens are automatically cleared, and users are redirected to the login page.

5. **Loading States**: The app shows loading indicators while checking authentication status to prevent UI flashing.

### Implementation Details

#### UserContext (`src/context/UserContext.tsx`)

- Manages user authentication state
- Automatically initializes user data from stored token on app startup
- Provides `isAuthenticated` and `isLoading` states
- Handles token expiration and cleanup

#### Utility Functions (`src/lib/util.ts`)

- `isTokenExpired()`: Checks if a JWT token has expired
- `getUserFromToken()`: Extracts user data from a JWT token
- `clearAuthData()`: Cleans up all authentication data
- `getTokenExpiration()`: Gets token expiration timestamp

#### API Service (`src/lib/apiService.ts`)

- Automatically includes JWT token in API requests
- Handles 401 responses by clearing auth data and redirecting to login
- Uses utility functions for consistent token management

#### Protected Routes (`src/main.tsx`)

- Shows loading state while checking authentication
- Redirects unauthenticated users to login page
- Prevents access to protected routes without valid authentication

### Authentication Flow

1. **Login**: User enters credentials → JWT token received → Stored in localStorage → User state updated → Redirect to dashboard

2. **Page Reload**: App starts → Token retrieved from localStorage → Token validated → User state restored → Continue to current page

3. **Token Expiration**: API call fails with 401 → Token cleared → User redirected to login

4. **Logout**: User clicks logout → Token cleared → User state reset → Redirect to login

### Security Considerations

- Tokens are automatically validated on app startup
- Expired tokens are immediately cleared
- Invalid tokens trigger automatic logout
- All authentication data is properly cleaned up on logout

### Usage

The authentication system is fully integrated into the app. Users will:

- Stay logged in across page reloads
- Be automatically logged out when their token expires
- See loading indicators during authentication checks
- Be redirected to login when accessing protected routes without authentication
