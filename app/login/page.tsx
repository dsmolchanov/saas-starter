import { Suspense } from 'react';
import { Login } from '../(login)/login';

export const metadata = {
  title: 'Login | Dzen Yoga'
};

// This page needs dynamic rendering for authentication and i18n
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <Suspense>
      <Login mode="signin" />
    </Suspense>
  );
} 