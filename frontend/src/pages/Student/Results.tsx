import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, X, Clock, BarChart2, ArrowLeft } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import FuturisticCard from '@/components/FuturisticCard';
import FuturisticButton from '@/components/FuturisticButton';
import { getUserTests, Test } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis,
  Tooltip
} from 'recharts';

const StudentResultsList: React.FC = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setIsLoading(true);
        const testsData = await getUserTests();
        // Filter tests that have results for this student
        const completedTests = testsData.filter(
          test => test.result[localStorage.getItem('userId') || '']
        );
        setTests(completedTests);
      } catch (error) {
        console.error('Error fetching tests:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch test results. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTests();
  }, [toast]);

  // Calculate overall statistics
  const totalTests = tests.length;
  const averageScore = totalTests
    ? tests.reduce((sum, test) => {
        const result = test.result[localStorage.getItem('userId') || ''];
        return sum + (result ? (result.score / result.totalQuestions) * 100 : 0);
      }, 0) / totalTests
    : 0;

  // Data for statistics charts
  const scoreDistribution = [
    { name: '0-40%', value: 0 },
    { name: '41-70%', value: 0 },
    { name: '71-100%', value: 0 },
  ];

  tests.forEach(test => {
    const result = test.result[localStorage.getItem('userId') || ''];
    if (result) {
      const score = (result.score / result.totalQuestions) * 100;
      if (score <= 40) scoreDistribution[0].value++;
      else if (score <= 70) scoreDistribution[1].value++;
      else scoreDistribution[2].value++;
    }
  });

  const scoreColors = ['#ff007a', '#9f7aea', '#00faff'];

  // Performance over time (most recent 5 tests)
  const recentTestsData = tests
    .slice(0, 5)
    .map(test => {
      const result = test.result[localStorage.getItem('userId') || ''];
      return {
        name: test.test_name.length > 15 
          ? test.test_name.substring(0, 15) + '...' 
          : test.test_name,
        score: result 
          ? Math.round((result.score / result.totalQuestions) * 100) 
          : 0
      };
    })
    .reverse();

  return (
    <DashboardLayout title="My Results">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neonCyan"></div>
        </div>
      ) : tests.length === 0 ? (
        <FuturisticCard>
          <div className="text-center py-10">
            <BarChart2 className="mx-auto h-12 w-12 text-neonCyan/60 mb-4" />
            <h3 className="text-xl font-semibold text-softWhite mb-2">No Results Found</h3>
            <p className="text-softWhite/60 mb-6">You haven't completed any tests yet.</p>
            <Link to="/student/tests">
              <FuturisticButton>
                View Available Tests
              </FuturisticButton>
            </Link>
          </div>
        </FuturisticCard>
      ) : (
        <div className="space-y-8">
          {/* Statistics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FuturisticCard>
                <div className="text-center">
                  <p className="text-sm text-softWhite/60 mb-2">Total Tests Completed</p>
                  <h3 className="text-3xl font-bold text-neonCyan">{totalTests}</h3>
                </div>
              </FuturisticCard>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <FuturisticCard>
                <div className="text-center">
                  <p className="text-sm text-softWhite/60 mb-2">Average Score</p>
                  <h3 className="text-3xl font-bold text-neonCyan">{Math.round(averageScore)}%</h3>
                </div>
              </FuturisticCard>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <FuturisticCard>
                <div className="text-center">
                  <p className="text-sm text-softWhite/60 mb-2">Total Questions Attempted</p>
                  <h3 className="text-3xl font-bold text-neonCyan">
                    {tests.reduce((sum, test) => {
                      const result = test.result[localStorage.getItem('userId') || ''];
                      return sum + (result ? result.totalQuestions : 0);
                    }, 0)}
                  </h3>
                </div>
              </FuturisticCard>
            </motion.div>
          </div>

          {/* Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <FuturisticCard>
                <h3 className="text-xl font-bold text-softWhite mb-4">Score Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={scoreDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {scoreDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={scoreColors[index]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1A1F2C', 
                          borderRadius: '0.5rem', 
                          border: 'none' 
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center space-x-4 mt-2">
                  {scoreDistribution.map((entry, index) => (
                    <div key={index} className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-1" 
                        style={{ backgroundColor: scoreColors[index] }} 
                      />
                      <span className="text-xs text-softWhite/70">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </FuturisticCard>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <FuturisticCard>
                <h3 className="text-xl font-bold text-softWhite mb-4">Recent Performance</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={recentTestsData}>
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1A1F2C', 
                          borderRadius: '0.5rem', 
                          border: 'none' 
                        }}
                      />
                      <Bar dataKey="score" fill="#00faff" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </FuturisticCard>
            </motion.div>
          </div>

          {/* Test Results List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-softWhite mb-4">All Test Results</h2>
            <div className="space-y-4">
              {tests.map((test, index) => {
                const result = test.result[localStorage.getItem('userId') || ''];
                const score = result ? Math.round((result.score / result.totalQuestions) * 100) : 0;
                
                return (
                  <FuturisticCard key={index} className="hover:border-neonCyan/50 transition-colors">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-softWhite">{test.test_name}</h3>
                        <p className="text-sm text-softWhite/70">
                          {test.pdf_name} • {result?.totalQuestions} questions
                        </p>
                      </div>
                      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-softWhite/70">
                            <Clock size={14} className="inline mr-1" />
                            {result?.timeSpent ? Math.floor(result.timeSpent / 60) : 0} mins
                          </div>
                          <div className={`text-sm font-medium ${
                            score >= 70 ? 'text-neonCyan' : 
                            score >= 40 ? 'text-violet' : 'text-neonPink'
                          }`}>
                            Score: {score}%
                          </div>
                        </div>
                        <Link to={`/student/results/${test.test_name}`}>
                          <FuturisticButton size="sm">
                            View Details
                          </FuturisticButton>
                        </Link>
                      </div>
                    </div>
                  </FuturisticCard>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

const StudentResultDetails: React.FC = () => {
  const { testName } = useParams<{ testName: string }>();
  const [test, setTest] = useState<Test | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTest = async () => {
      try {
        setIsLoading(true);
        const testsData = await getUserTests({ test_name: testName });
        if (testsData.length > 0) {
          setTest(testsData[0]);
        } else {
          toast({
            title: 'Error',
            description: 'Test not found.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error fetching test:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch test results. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (testName) {
      fetchTest();
    }
  }, [testName, toast]);

  if (isLoading) {
    return (
      <DashboardLayout title="Test Results">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neonCyan"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!test || !test.result[localStorage.getItem('userId') || '']) {
    return (
      <DashboardLayout title="Test Results">
        <FuturisticCard>
          <div className="text-center py-10">
            <X className="mx-auto h-12 w-12 text-neonPink/60 mb-4" />
            <h3 className="text-xl font-semibold text-softWhite mb-2">Results Not Found</h3>
            <p className="text-softWhite/60 mb-6">The test results you're looking for could not be found.</p>
            <Link to="/student/results">
              <FuturisticButton>
                Back to Results
              </FuturisticButton>
            </Link>
          </div>
        </FuturisticCard>
      </DashboardLayout>
    );
  }

  const result = test.result[localStorage.getItem('userId') || ''];
  const score = Math.round((result.score / result.totalQuestions) * 100);
  const answersArray = Object.entries(result.answers || {}).map(([index, answer]) => ({
    questionIndex: parseInt(index),
    userAnswer: answer
  }));

  return (
    <DashboardLayout title={`Test Results: ${test.test_name}`}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Link to="/student/results" className="inline-flex items-center text-neonCyan hover:underline">
            <ArrowLeft size={16} className="mr-1" />
            Back to Results
          </Link>
        </div>

        {/* Result Summary */}
        <FuturisticCard>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-softWhite/60 mb-1">Score</p>
              <h3 className={`text-3xl font-bold ${
                score >= 70 ? 'text-neonCyan' : 
                score >= 40 ? 'text-violet' : 'text-neonPink'
              }`}>{score}%</h3>
              <p className="text-xs text-softWhite/50 mt-1">
                {result.score} out of {result.totalQuestions} correct
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-softWhite/60 mb-1">Time Spent</p>
              <h3 className="text-3xl font-bold text-softWhite">
                {result.timeSpent ? Math.floor(result.timeSpent / 60) : 0}:{result.timeSpent ? (result.timeSpent % 60).toString().padStart(2, '0') : '00'}
              </h3>
              <p className="text-xs text-softWhite/50 mt-1">minutes:seconds</p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-softWhite/60 mb-1">Test Date</p>
              <h3 className="text-3xl font-bold text-softWhite">
                {new Date(test.created_at).toLocaleDateString()}
              </h3>
              <p className="text-xs text-softWhite/50 mt-1">{test.pdf_name}</p>
            </div>
          </div>
        </FuturisticCard>

        {/* Question Review */}
        <h2 className="text-2xl font-bold text-softWhite mt-8 mb-4">Questions Review</h2>
        <div className="space-y-6">
          {test.mcqs.map((mcq, index) => {
            const userAnswerObj = answersArray.find(a => a.questionIndex === index);
            const userAnswer = userAnswerObj ? userAnswerObj.userAnswer : null;
            const isCorrect = userAnswer === mcq.correct_answer;
            
            return (
              <FuturisticCard 
                key={index} 
                className={`border-l-4 ${
                  isCorrect ? 'border-neonCyan' : 'border-neonPink'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className={`rounded-full p-1 mr-2 ${
                        isCorrect ? 'bg-neonCyan/20 text-neonCyan' : 'bg-neonPink/20 text-neonPink'
                      }`}>
                        {isCorrect ? <Check size={16} /> : <X size={16} />}
                      </div>
                      <h3 className="text-lg font-semibold text-softWhite">Question {index + 1}</h3>
                    </div>
                    <p className="text-softWhite mb-4">{mcq.question}</p>
                    
                    <div className="space-y-2">
                      {mcq.options.map((option, optIndex) => (
                        <div 
                          key={optIndex}
                          className={`p-3 rounded-lg border ${
                            option === mcq.correct_answer 
                              ? 'border-neonCyan bg-neonCyan/10 text-neonCyan' 
                              : option === userAnswer 
                                ? 'border-neonPink bg-neonPink/10 text-neonPink'
                                : 'border-softWhite/20 text-softWhite/70'
                          }`}
                        >
                          {option}
                          {option === mcq.correct_answer && (
                            <span className="ml-2 text-xs">(Correct Answer)</span>
                          )}
                          {option === userAnswer && option !== mcq.correct_answer && (
                            <span className="ml-2 text-xs">(Your Answer)</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </FuturisticCard>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

const StudentResults: React.FC = () => {
  const { testName } = useParams<{ testName?: string }>();
  
  return testName ? <StudentResultDetails /> : <StudentResultsList />;
};

export default StudentResults;
