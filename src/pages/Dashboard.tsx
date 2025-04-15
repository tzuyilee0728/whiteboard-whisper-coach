
import React from 'react';
import { useSession } from '@/context/SessionContext';
import NavBar from '@/components/NavBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Clock, Calendar, Star, BarChart } from 'lucide-react';

const Dashboard = () => {
  const { sessions } = useSession();
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'junior': return 'bg-green-100 text-green-800';
      case 'mid-level': return 'bg-yellow-100 text-yellow-800';
      case 'senior': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };
  
  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'e-commerce': return 'bg-purple-100 text-purple-800';
      case 'healthcare': return 'bg-blue-100 text-blue-800';
      case 'finance': return 'bg-emerald-100 text-emerald-800';
      case 'social': return 'bg-pink-100 text-pink-800';
      case 'productivity': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Dashboard</h1>
            <p className="text-gray-600 mt-1">Track your practice sessions and progress</p>
          </div>
          
          <Link to="/practice">
            <Button className="mt-4 md:mt-0 bg-brand-600 hover:bg-brand-700">
              New Practice Session
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total Sessions</CardTitle>
              <CardDescription>Practice sessions completed</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{sessions.length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Practice Time</CardTitle>
              <CardDescription>Total minutes spent practicing</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">
                {sessions.reduce((total, session) => total + session.duration, 0)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Average Rating</CardTitle>
              <CardDescription>Based on your session performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <p className="text-4xl font-bold">
                  {(sessions
                    .filter(s => s.feedback)
                    .reduce((total, s) => total + (s.feedback?.overallRating || 0), 0) / 
                    sessions.filter(s => s.feedback).length
                  ).toFixed(1)}
                </p>
                <Star className="h-5 w-5 text-yellow-500 ml-2" fill="currentColor" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Sessions</h2>
        
        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">You haven't completed any practice sessions yet.</p>
            <Link to="/practice">
              <Button>Start Your First Session</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {sessions.slice().reverse().map(session => (
              <Card key={session.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="flex-grow p-6">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline" className={getDifficultyColor(session.challenge.difficulty)}>
                        {session.challenge.difficulty}
                      </Badge>
                      <Badge variant="outline" className={getCategoryColor(session.challenge.category)}>
                        {session.challenge.category}
                      </Badge>
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-2">{session.challenge.title}</h3>
                    
                    <div className="flex flex-wrap text-sm text-gray-500 mb-4 gap-x-4 gap-y-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(session.date)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {session.duration} minutes
                      </div>
                      {session.feedback && (
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-1 text-yellow-500" fill="currentColor" />
                          {session.feedback.overallRating.toFixed(1)}
                        </div>
                      )}
                    </div>
                    
                    {session.feedback && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 mb-1">Key Strengths:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 mb-3 pl-2">
                          {session.feedback.strengths.slice(0, 2).map((strength, i) => (
                            <li key={i}>{strength}</li>
                          ))}
                        </ul>
                        
                        <h4 className="font-medium text-gray-900 mb-1">Areas for Improvement:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 pl-2">
                          {session.feedback.improvements.slice(0, 2).map((improvement, i) => (
                            <li key={i}>{improvement}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col justify-center items-center p-6 bg-gray-50 border-t md:border-l md:border-t-0">
                    {session.feedback ? (
                      <div className="text-center">
                        <div className="mb-3">
                          <BarChart className="h-6 w-6 mx-auto text-brand-600" />
                        </div>
                        <Button size="sm" variant="outline" className="mb-2">
                          View Full Feedback
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-gray-500 text-sm mb-3">Session in progress</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <footer className="bg-gray-800 text-white py-8 mt-10">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 AI Whiteboard Challenge Coach</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;

