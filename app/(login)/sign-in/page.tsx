import { Suspense } from 'react';
import { Login } from '../login';

// This page needs dynamic rendering for authentication
export const dynamic = 'force-dynamic';

export default function SignInPage() {
  return (
    <Suspense>
      <Login mode="signin" />
    </Suspense>
  );
}
