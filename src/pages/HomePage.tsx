import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Lightbulb, Clock, MessageSquare } from 'lucide-react';
import NavBar from '@/components/NavBar';
const HomePage = () => {
  return <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow">
        <section className="bg-brand-50 py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Practice Whiteboard Challenges with AI Coaching
              </h1>
              <p className="text-xl text-gray-700 mb-8">
                Improve your product design interview skills with personalized feedback
                and realistic challenges, anytime you need to practice.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/practice">
                  <Button size="lg" className="bg-brand-600 hover:bg-brand-700">
                    Start Practice Session
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="outline" size="lg" className="when hovering on the button, update the text color into #fff">
                    View Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-lg text-gray-600">
                Our AI coach helps you practice whiteboard challenges through 
                a structured approach that mimics real interviews.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-brand-100 text-brand-600 mb-4">
                  <Lightbulb />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Realistic Challenges
                </h3>
                <p className="text-gray-600">
                  Practice with industry-relevant design challenges at various difficulty levels.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-brand-100 text-brand-600 mb-4">
                  <Clock />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Structured Process
                </h3>
                <p className="text-gray-600">
                  Follow guided sections with timers to improve your pacing and organization.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-brand-100 text-brand-600 mb-4">
                  <MessageSquare />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Personalized Feedback
                </h3>
                <p className="text-gray-600">
                  Receive constructive feedback on your approach, solutions, and communication.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
                Designed for Product Designers
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-brand-500 flex-shrink-0 mr-3" />
                  <p className="text-gray-700">
                    <strong>Varied industry challenges</strong> across e-commerce, healthcare, finance and more
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-brand-500 flex-shrink-0 mr-3" />
                  <p className="text-gray-700">
                    <strong>Interactive AI questioning</strong> that simulates realistic stakeholder feedback
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-brand-500 flex-shrink-0 mr-3" />
                  <p className="text-gray-700">
                    <strong>Time management guidance</strong> to help you pace your whiteboard session effectively
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-brand-500 flex-shrink-0 mr-3" />
                  <p className="text-gray-700">
                    <strong>Progress tracking</strong> to see how your skills improve over multiple sessions
                  </p>
                </div>
              </div>

              <div className="mt-10 text-center">
                <Link to="/practice">
                  <Button size="lg" className="bg-brand-600 hover:bg-brand-700">
                    Start Your First Session
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p>&copy; 2025 AI Whiteboard Challenge Coach</p>
          </div>
        </div>
      </footer>
    </div>;
};
export default HomePage;