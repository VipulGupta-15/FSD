import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart2, ArrowLeft, Clock, Download, Star, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import FuturisticCard from '@/components/FuturisticCard';
import FuturisticButton from '@/components/FuturisticButton';
import { getUserTests, getStudentResults, getStudents, Test, User } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const TestResultsList: React.FC = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setIsLoading(true);
        const testsData = await getUserTests();
        // Filter tests that have at least one result
        const testsWithResults = testsData.filter(test => 
          test.result && Object.keys(test.result).length > 0
        );
        setTests(testsWithResults);
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

  return (
    <DashboardLayout title="Test Results">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neonCyan"></div>
        </div>
      ) : tests.length === 0 ? (
        <FuturisticCard>
          <div className="text-center py-10">
            <AlertCircle className="mx-auto h-12 w-12 text-neonCyan/60 mb-4" />
            <h3 className="text-xl font-semibold text-softWhite mb-2">No Test Results Yet</h3>
            <p className="text-softWhite/60 mb-6">None of your tests have been completed by students yet.</p>
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <Link to="/teacher/manage-tests">
                <FuturisticButton>
                  Manage Tests
                </FuturisticButton>
              </Link>
              <Link to="/teacher/mcq-generator">
                <FuturisticButton variant="outline">
                  Create New Test
                </FuturisticButton>
              </Link>
            </div>
          </div>
        </FuturisticCard>
      ) : (
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <FuturisticCard>
              <h2 className="text-xl font-bold text-softWhite mb-6">Overall Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-sm text-softWhite/60 mb-2">Total Tests</p>
                  <h3 className="text-3xl font-bold text-neonCyan">{tests.length}</h3>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-softWhite/60 mb-2">Total Submissions</p>
                  <h3 className="text-3xl font-bold text-neonCyan">
                    {tests.reduce((sum, test) => sum + Object.keys(test.result).length, 0)}
                  </h3>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-softWhite/60 mb-2">Average Score</p>
                  <h3 className="text-3xl font-bold text-neonCyan">
                    {Math.round(
                      tests.reduce((sum, test) => {
                        const testScores = Object.values(test.result).map(
                          result => (result.score / result.totalQuestions) * 100
                        );
                        return sum + (testScores.length ? testScores.reduce((a, b) => a + b, 0) / testScores.length : 0);
                      }, 0) / tests.length
                    )}%
                  </h3>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-softWhite/60 mb-2">Pass Rate</p>
                  <h3 className="text-3xl font-bold text-neonCyan">
                    {Math.round(
                      (tests.reduce((sum, test) => {
                        return sum + Object.values(test.result).filter(
                          result => (result.score / result.totalQuestions) >= 0.6
                        ).length;
                      }, 0) / 
                      tests.reduce((sum, test) => sum + Object.keys(test.result).length, 0)) * 100
                    )}%
                  </h3>
                </div>
              </div>
            </FuturisticCard>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-softWhite mb-4">Test Results</h2>
            <div className="space-y-4">
              {tests.map((test, index) => {
                const totalSubmissions = Object.keys(test.result).length;
                const passCount = Object.values(test.result).filter(
                  result => (result.score / result.totalQuestions) >= 0.6
                ).length;
                const averageScore = Math.round(
                  Object.values(test.result).reduce(
                    (sum, result) => sum + ((result.score / result.totalQuestions) * 100), 0
                  ) / totalSubmissions
                );
                
                return (
                  <FuturisticCard key={index} className="hover:border-neonCyan/50 transition-colors">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-softWhite">{test.test_name}</h3>
                        <p className="text-sm text-softWhite/70 mb-2">{test.pdf_name}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                          <div className="text-softWhite/70">
                            <Clock size={14} className="inline mr-1" />
                            Duration: {test.duration || 'N/A'} min
                          </div>
                          <div className="text-softWhite/70">
                            Questions: {test.mcqs.length}
                          </div>
                          <div className="text-softWhite/70">
                            Submissions: {totalSubmissions}/{test.assigned_to.length}
                          </div>
                          <div className="text-neonCyan">
                            Avg. Score: {averageScore}%
                          </div>
                        </div>
                      </div>
                      <Link to={`/teacher/results/${test.test_name}`}>
                        <FuturisticButton size="sm">
                          View Details
                        </FuturisticButton>
                      </Link>
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

const TestResultDetails: React.FC = () => {
  const { testName } = useParams<{ testName: string }>();
  const [test, setTest] = useState<Test | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch test details
        const testsData = await getUserTests({ test_name: testName });
        if (testsData.length === 0) {
          toast({
            title: 'Error',
            description: 'Test not found.',
            variant: 'destructive',
          });
          return;
        }
        setTest(testsData[0]);
        
        // Fetch students data to map IDs to names
        const studentsData = await getStudents();
        setStudents(studentsData);
        
      } catch (error) {
        console.error('Error fetching data:', error);
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
      fetchData();
    }
  }, [testName, toast]);

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s._id === studentId);
    return student ? student.name : `Student ${studentId.substring(0, 6)}...`;
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Loading Results...">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neonCyan"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!test) {
    return (
      <DashboardLayout title="Test Results">
        <FuturisticCard>
          <div className="text-center py-10">
            <AlertCircle className="mx-auto h-12 w-12 text-neonPink/60 mb-4" />
            <h3 className="text-xl font-semibold text-softWhite mb-2">Test Not Found</h3>
            <p className="text-softWhite/60 mb-6">The test you're looking for could not be found.</p>
            <Link to="/teacher/results">
              <FuturisticButton>
                Back to Results
              </FuturisticButton>
            </Link>
          </div>
        </FuturisticCard>
      </DashboardLayout>
    );
  }

  // No results
  if (!test.result || Object.keys(test.result).length === 0) {
    return (
      <DashboardLayout title={`Results: ${test.test_name}`}>
        <div className="mb-6">
          <Link to="/teacher/results" className="text-neonCyan hover:underline flex items-center">
            <ArrowLeft size={16} className="mr-1" />
            Back to Results
          </Link>
        </div>
        <FuturisticCard>
          <div className="text-center py-10">
            <AlertCircle className="mx-auto h-12 w-12 text-neonCyan/60 mb-4" />
            <h3 className="text-xl font-semibold text-softWhite mb-2">No Results Yet</h3>
            <p className="text-softWhite/60 mb-6">No students have completed this test yet.</p>
            <Link to="/teacher/manage-tests">
              <FuturisticButton>
                Manage Test
              </FuturisticButton>
            </Link>
          </div>
        </FuturisticCard>
      </DashboardLayout>
    );
  }

  // Prepare data for charts
  const resultEntries = Object.entries(test.result).map(([studentId, result]) => ({
    studentId,
    studentName: getStudentName(studentId),
    score: (result.score / result.totalQuestions) * 100,
    correctAnswers: result.score,
    wrongAnswers: result.totalQuestions - result.score,
    timeSpent: result.timeSpent / 60 // convert to minutes
  }));

  // Sort by score (descending)
  resultEntries.sort((a, b) => b.score - a.score);

  // Score distribution data for pie chart
  const scoreDistribution = [
    { name: '0-40%', value: 0, color: '#ff007a' },
    { name: '41-70%', value: 0, color: '#9f7aea' },
    { name: '71-100%', value: 0, color: '#00faff' }
  ];

  resultEntries.forEach(entry => {
    if (entry.score <= 40) scoreDistribution[0].value++;
    else if (entry.score <= 70) scoreDistribution[1].value++;
    else scoreDistribution[2].value++;
  });

  // Question analysis data
  const questionAnalysis = test.mcqs.map((_, index) => {
    const correctCount = Object.values(test.result).filter(result => 
      result.answers[index] === test.mcqs[index].correct_answer
    ).length;
    
    return {
      number: index + 1,
      correct: correctCount,
      incorrect: Object.keys(test.result).length - correctCount,
      correctPercentage: (correctCount / Object.keys(test.result).length) * 100
    };
  });

  return (
    <DashboardLayout title={`Results: ${test.test_name}`}>
      <div className="mb-6">
        <Link to="/teacher/results" className="text-neonCyan hover:underline flex items-center">
          <ArrowLeft size={16} className="mr-1" />
          Back to Results
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-2"
        >
          <FuturisticCard>
            <h2 className="text-xl font-bold text-softWhite mb-6">Test Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="text-center">
                <p className="text-sm text-softWhite/60 mb-2">Total Students</p>
                <h3 className="text-3xl font-bold text-softWhite">{test.assigned_to.length}</h3>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-softWhite/60 mb-2">Submissions</p>
                <h3 className="text-3xl font-bold text-softWhite">{Object.keys(test.result).length}</h3>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-softWhite/60 mb-2">Average Score</p>
                <h3 className="text-3xl font-bold text-neonCyan">
                  {Math.round(
                    resultEntries.reduce((sum, entry) => sum + entry.score, 0) / resultEntries.length
                  )}%
                </h3>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-softWhite/60 mb-2">Pass Rate</p>
                <h3 className="text-3xl font-bold text-neonCyan">
                  {Math.round(
                    (resultEntries.filter(entry => entry.score >= 60).length / resultEntries.length) * 100
                  )}%
                </h3>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-softWhite mb-4">Student Score Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={resultEntries.slice(0, 10)} layout="vertical" margin={{ left: 100 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: '#f5f5f5' }} />
                    <YAxis 
                      dataKey="studentName" 
                      type="category" 
                      tick={{ fill: '#f5f5f5' }} 
                      width={100}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1A1F2C', 
                        borderRadius: '0.5rem', 
                        border: 'none' 
                      }}
                      formatter={(value) => [`${value}%`, 'Score']}
                    />
                    <Bar 
                      dataKey="score" 
                      fill="#00faff" 
                      background={{ fill: '#334155' }}
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {resultEntries.length > 10 && (
                <p className="text-center text-xs text-softWhite/60 mt-2">
                  Showing top 10 of {resultEntries.length} students
                </p>
              )}
            </div>
          </FuturisticCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <FuturisticCard>
            <h2 className="text-xl font-bold text-softWhite mb-6">Score Distribution</h2>
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
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1A1F2C', 
                      borderRadius: '0.5rem', 
                      border: 'none' 
                    }}
                    formatter={(value) => [`${value} student${value !== 1 ? 's' : ''}`, 'Count']}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 pt-4 border-t border-neonCyan/10">
              <h3 className="text-lg font-semibold text-softWhite mb-2">Download Results</h3>
              <FuturisticButton className="w-full" variant="outline">
                <Download size={16} className="mr-2" />
                Export to CSV
              </FuturisticButton>
            </div>
          </FuturisticCard>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <FuturisticCard>
          <h2 className="text-xl font-bold text-softWhite mb-6">Question Analysis</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neonCyan/20">
                  <th className="p-3 text-left text-softWhite/70">Question #</th>
                  <th className="p-3 text-left text-softWhite/70">Correct</th>
                  <th className="p-3 text-left text-softWhite/70">Incorrect</th>
                  <th className="p-3 text-left text-softWhite/70">Success Rate</th>
                  <th className="p-3 text-left text-softWhite/70">Difficulty</th>
                </tr>
              </thead>
              <tbody>
                {questionAnalysis.map((question, index) => (
                  <tr key={index} className="border-b border-neonCyan/10">
                    <td className="p-3 text-softWhite">{question.number}</td>
                    <td className="p-3 text-neonCyan">{question.correct}</td>
                    <td className="p-3 text-neonPink">{question.incorrect}</td>
                    <td className="p-3">
                      <div className="w-full bg-deepBlue/50 rounded-full h-2.5">
                        <div 
                          className="bg-neonCyan h-2.5 rounded-full" 
                          style={{ width: `${question.correctPercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-softWhite/70 mt-1 inline-block">
                        {Math.round(question.correctPercentage)}%
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        test.mcqs[index].difficulty === 'easy' ? 'bg-neonCyan/20 text-neonCyan' :
                        test.mcqs[index].difficulty === 'medium' ? 'bg-violet/20 text-violet' :
                        'bg-neonPink/20 text-neonPink'
                      }`}>
                        {test.mcqs[index].difficulty.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FuturisticCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="mt-8"
      >
        <h2 className="text-2xl font-bold text-softWhite mb-4">Student Results</h2>
        <div className="space-y-4">
          {resultEntries.map((entry, index) => (
            <FuturisticCard key={index} className="hover:border-neonCyan/50 transition-colors">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-deepBlue/70 flex items-center justify-center text-neonCyan">
                      {entry.studentName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-softWhite">{entry.studentName}</h3>
                      <p className="text-sm text-softWhite/70">
                        {entry.studentId}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="min-w-[80px] text-center">
                    <p className="text-xs text-softWhite/60">Score</p>
                    <p className={`text-lg font-bold ${
                      entry.score >= 70 ? 'text-neonCyan' :
                      entry.score >= 40 ? 'text-violet' :
                      'text-neonPink'
                    }`}>
                      {Math.round(entry.score)}%
                    </p>
                  </div>
                  
                  <div className="min-w-[80px] text-center">
                    <p className="text-xs text-softWhite/60">Correct</p>
                    <p className="text-lg font-bold text-softWhite">
                      {entry.correctAnswers}/{entry.correctAnswers + entry.wrongAnswers}
                    </p>
                  </div>
                  
                  <div className="min-w-[80px] text-center">
                    <p className="text-xs text-softWhite/60">Time</p>
                    <p className="text-lg font-bold text-softWhite">
                      {Math.floor(entry.timeSpent)}:{Math.round((entry.timeSpent % 1) * 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star 
                        key={star}
                        size={16} 
                        className={star <= Math.ceil(entry.score / 20) ? 'text-neonCyan fill-neonCyan' : 'text-softWhite/30'} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </FuturisticCard>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

const TeacherResults: React.FC = () => {
  const { testName } = useParams<{ testName?: string }>();
  
  return testName ? <TestResultDetails /> : <TestResultsList />;
};

export default TeacherResults;
