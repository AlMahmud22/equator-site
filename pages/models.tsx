import Head from 'next/head'
import Layout from '@/components/Layout'
import ModelsPage from '@/modules/models/ModelsPage'

export default function Models() {
  return (
    <>
      <Head>
        <title>AI Models Hub - Equators</title>
        <meta 
          name="description" 
          content="Browse, download, and experiment with AI models in a privacy-focused environment. Secure local processing for your machine learning projects." 
        />
      </Head>
      <Layout>
        <ModelsPage />
      </Layout>
    </>
  )
}
