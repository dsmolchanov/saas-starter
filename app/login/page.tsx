import { Suspense } from 'react';
import { Login } from '../(login)/login';

export const metadata = {
  title: 'Login | Dzen Yoga'
};

export default function LoginPage() {
  return (
    <Suspense>
      <Login mode="signin" />
    </Suspense>
  );
} 