'use client';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';

export default function RemovedPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow flex items-center justify-center text-center p-4">
         <div>
            <h1 className="text-3xl font-bold">Backend Functionality Removed</h1>
            <p className="text-muted-foreground mt-2">This page was part of the backend functionality and has been removed.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
