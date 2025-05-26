import { Navigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription } from "flowbite-react";
import { Building2, Brain, Sparkles, BarChart3, Lightbulb, TrendingUp } from "react-icons/ai";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Pharma RepuScore™ + LLMO Advisor
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Advanced LLM reputation benchmarking and optimization platform for pharmaceutical products. 
            Analyze how AI models represent your products and get actionable recommendations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Link to="/selection" className="group">
            <Card className="h-full transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 hover:border-blue-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Company Dashboard</CardTitle>
                <CardDescription>
                  Browse pharmaceutical companies and their product portfolios
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/product-analysis" className="group">
            <Card className="h-full transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 hover:border-green-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                  <Brain className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Product Analysis</CardTitle>
                <CardDescription>
                  Run AI analysis on specific pharmaceutical products
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/enhanced-analysis" className="group">
            <Card className="h-full transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 hover:border-purple-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                  <Sparkles className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Multi-LLM Benchmark</CardTitle>
                <CardDescription>
                  Comprehensive analysis using multiple AI models with advanced scoring
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/dashboard" className="group">
            <Card className="h-full transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 hover:border-indigo-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-200 transition-colors">
                  <BarChart3 className="w-8 h-8 text-indigo-600" />
                </div>
                <CardTitle className="text-xl">RepuScore Dashboard</CardTitle>
                <CardDescription>
                  Compare products and view optimization recommendations
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Card className="h-full border-2 border-gray-200">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-8 h-8 text-gray-400" />
              </div>
              <CardTitle className="text-xl text-gray-500">Knowledge Base</CardTitle>
              <CardDescription className="text-gray-400">
                Access LLM optimization strategies and best practices (Coming Soon)
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="h-full border-2 border-gray-200">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-gray-400" />
              </div>
              <CardTitle className="text-xl text-gray-500">Advanced Analytics</CardTitle>
              <CardDescription className="text-gray-400">
                Deep insights and competitive intelligence (Coming Soon)
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Company Dashboard
              </h3>
              <p className="text-gray-600">
                Browse pharmaceutical companies and their product portfolios
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Product Analysis
              </h3>
              <p className="text-gray-600">
                Run AI analysis on specific pharmaceutical products
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Multi-LLM Benchmark
              </h3>
              <p className="text-gray-600">
                Comprehensive analysis using multiple AI models with advanced scoring
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                RepuScore Dashboard
              </h3>
              <p className="text-gray-600">
                Compare products and view optimization recommendations
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Knowledge Base
              </h3>
              <p className="text-gray-600">
                Access LLM optimization strategies and best practices (Coming Soon)
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Advanced Analytics
              </h3>
              <p className="text-gray-600">
                Deep insights and competitive intelligence (Coming Soon)
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Contact Us
          </h2>
          <p className="text-gray-600">
            For more information or to request a demo, please contact us at
            <a href="mailto:info@pharmarepu.com" className="text-blue-600 hover:underline">
              info@pharmarepu.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
