import React from 'react'
import { NextPage } from 'next'
import Layout from '@/components/Layout'

const CookiePolicyPage: NextPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6">Cookie Policy</h1>
        <p className="text-gray-600">
          Cookie policy information will be available here.
        </p>
      </div>
    </Layout>
  )
}

export default CookiePolicyPage