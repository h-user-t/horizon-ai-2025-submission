// app/utils/firebaseErrors.js
export const getFirebaseErrorMessage = (error) => {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please try signing in instead.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/operation-not-allowed':
        return 'This sign in method is not enabled. Please contact support.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/popup-closed-by-user':
        return 'Sign in popup was closed before completion. Please try again.';
      case 'auth/cancelled-popup-request':
        return 'The sign in process was cancelled. Please try again.';
      case 'auth/popup-blocked':
        return 'Sign in popup was blocked by your browser. Please allow popups for this site.';
      case 'auth/requires-recent-login':
        return 'Please sign in again to complete this action.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/invalid-verification-code':
        return 'Invalid verification code. Please try again.';
      case 'auth/invalid-verification-id':
        return 'Invalid verification. Please try again.';
      case 'auth/invalid-credential':
        return 'Invalid credentials. Please try again.';
      default:
        return 'An error occurred during sign up. Please try again.';
    }
};