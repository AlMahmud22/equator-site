'use client';

import Hero from '@/components/Hero';
import ProductShowcase from '@/components/Product/ProductShowcase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ProductShowcase />
      </main>
      <Footer />
    </>
  );
}
