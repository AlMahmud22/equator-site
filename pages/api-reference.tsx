import React from 'react'
import { NextPage } from 'next'
import Layout from '@/components/Layout'

const ApiReferencePage: NextPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6">API Reference</h1>
        <p className="text-gray-600">
          API documentation and reference guides will be available here.
        </p>
      </div>
    </Layout>
  )
}

export default ApiReferencePage