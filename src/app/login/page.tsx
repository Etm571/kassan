import { Suspense } from 'react';
import SignInPage from './client';

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInPage />
    </Suspense>
  );
}
