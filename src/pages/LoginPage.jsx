import React from 'react'
import LoginForm from '../components/LoginForm.jsx'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-900 px-4">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-brand shadow-hover mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-secondaryGray-900 mb-2">Welcome Back</h1>
          <p className="text-secondaryGray-800">Sign in to your AI SQL Chat account</p>
        </div>

        {/* Login Card */}
        <div className="bg-secondaryGray-100 rounded-card shadow-card border border-secondaryGray-400 p-8">
          <LoginForm />
        </div>

        {/* Footer Text */}
        <div className="text-center mt-6">
          <p className="text-sm text-secondaryGray-800">
            Powered by OpenAI GPT-4 • Secure Database Access
          </p>
        </div>
      </div>
    </div>
  )
}









