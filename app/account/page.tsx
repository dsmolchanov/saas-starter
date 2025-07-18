import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Account'
};

export default function AccountPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">Account</h1>
      <p className="text-muted-foreground">Manage your profile and subscription. (Coming soon)</p>
    </div>
  );
}
