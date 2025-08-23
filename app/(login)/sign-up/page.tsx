import { Suspense } from 'react';
import { LoginPasswordless } from '../login-passwordless';

// This page needs dynamic rendering for authentication
export const dynamic = 'force-dynamic';

export default function SignUpPage() {
  return (
    <Suspense>
      <LoginPasswordless mode="signup" />
    </Suspense>
  );
}
