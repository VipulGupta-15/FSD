import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, FileText, BarChart2, Clock, ArrowRight } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import FuturisticCard from '@/components/FuturisticCard';
import FuturisticButton from '@/components/FuturisticButton';
import { getUserTests, Test } from '@/services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const StudentDashboard: React.FC = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const testsData = await getUserTests();
        setTests(testsData);
      } catch (error) {
        console.error('Error fetching tests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTests();
  }, []);

  // Calculate test statistics
  const pendingTests = tests.filter(test => test.status === 'assigned' && !test.result[localStorage.getItem('userId') || '']);
  const completedTests = tests.filter(test => test.result[localStorage.getItem('userId') || '']);
  
  // Prepare data for charts
  const testStatusData = [
    { name: 'Completed', value: completedTests.length, color: '#00faff' },
    { name: 'Pending', value: pendingTests.length, color: '#ff007a' },
  ];
  
  // Calculate average score if there are completed tests
  const averageScore = completedTests.length
    ? completedTests.reduce((sum, test) => {
        const result = test.result[localStorage.getItem('userId') || ''];
        return sum + (result ? (result.score / result.totalQuestions) * 100 : 0);
      }, 0) / completedTests.length
    : 0;

  // Format for score gauge
  const scoreData = [
    { name: 'Score', value: averageScore, color: '#00faff' },
    { name: 'Remaining', value: 100 - averageScore, color: '#1A1F2C' },
  ];

  return (
    <DashboardLayout title="Student Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <FuturisticCard className="h-full" hoverable>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-softWhite/60 text-sm mb-1">Completed Tests</p>
                <h3 className="text-3xl font-bold text-softWhite">{completedTests.length}</h3>
              </div>
              <div className="p-3 rounded-full bg-neonCyan/10 text-neonCyan">
                <BookOpen size={24} />
              </div>
            </div>
          </FuturisticCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <FuturisticCard className="h-full" hoverable>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-softWhite/60 text-sm mb-1">Pending Tests</p>
                <h3 className="text-3xl font-bold text-softWhite">{pendingTests.length}</h3>
              </div>
              <div className="p-3 rounded-full bg-neonPink/10 text-neonPink">
                <Clock size={24} />
              </div>
            </div>
          </FuturisticCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <FuturisticCard className="h-full" hoverable>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-softWhite/60 text-sm mb-1">Average Score</p>
                <h3 className="text-3xl font-bold text-softWhite">
                  {completedTests.length ? `${Math.round(averageScore)}%` : 'N/A'}
                </h3>
              </div>
              <div className="p-3 rounded-full bg-violet/10 text-violet">
                <BarChart2 size={24} />
              </div>
            </div>
          </FuturisticCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <FuturisticCard className="h-full" hoverable>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-softWhite/60 text-sm mb-1">Generated MCQs</p>
                <h3 className="text-3xl font-bold text-softWhite">
                  {tests.reduce((sum, test) => sum + test.mcqs.length, 0)}
                </h3>
              </div>
              <div className="p-3 rounded-full bg-neonCyan/10 text-neonCyan">
                <FileText size={24} />
              </div>
            </div>
          </FuturisticCard>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-2"
        >
          <FuturisticCard className="h-full">
            <h3 className="text-xl font-bold text-softWhite mb-6">Recent Assigned Tests</h3>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-neonCyan"></div>
              </div>
            ) : pendingTests.length > 0 ? (
              <div className="space-y-4">
                {pendingTests.slice(0, 3).map((test, index) => (
                  <div key={index} className="border border-neonCyan/10 rounded-lg p-4 bg-deepBlue/30">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-softWhite">{test.test_name}</h4>
                        <p className="text-sm text-softWhite/60">
                          From: {test.pdf_name} • {test.mcqs.length} questions
                        </p>
                      </div>
                      <Link to={`/student/take-test/${test.test_name}`}>
                        <FuturisticButton size="sm">
                          Take Test
                        </FuturisticButton>
                      </Link>
                    </div>
                  </div>
                ))}

                {pendingTests.length > 3 && (
                  <div className="text-center mt-4">
                    <Link to="/student/tests">
                      <FuturisticButton variant="outline" size="sm">
                        View All Tests <ArrowRight size={16} className="ml-1" />
                      </FuturisticButton>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-softWhite/60 mb-4">No pending tests found</p>
                <Link to="/student/generate-mcqs">
                  <FuturisticButton size="sm">
                    Generate Your Own MCQs
                  </FuturisticButton>
                </Link>
              </div>
            )}
          </FuturisticCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <FuturisticCard className="h-full">
            <h3 className="text-xl font-bold text-softWhite mb-6">Test Statistics</h3>
            <div className="h-60">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-neonCyan"></div>
                </div>
              ) : tests.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={testStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {testStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1A1F2C', borderRadius: '0.5rem', border: 'none' }} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex justify-center items-center h-full">
                  <p className="text-softWhite/60">No test data available</p>
                </div>
              )}
            </div>
          </FuturisticCard>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <FuturisticCard className="h-full">
            <h3 className="text-xl font-bold text-softWhite mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/student/generate-mcqs" className="w-full">
                <FuturisticButton className="w-full flex justify-center items-center">
                  <FileText size={18} className="mr-2" />
                  Generate MCQs
                </FuturisticButton>
              </Link>
              <Link to="/student/tests" className="w-full">
                <FuturisticButton variant="secondary" className="w-full flex justify-center items-center">
                  <BookOpen size={18} className="mr-2" />
                  View Tests
                </FuturisticButton>
              </Link>
              <Link to="/student/results" className="w-full">
                <FuturisticButton variant="outline" className="w-full flex justify-center items-center">
                  <BarChart2 size={18} className="mr-2" />
                  Check Results
                </FuturisticButton>
              </Link>
              <Link to="/student/profile" className="w-full">
                <FuturisticButton variant="ghost" className="w-full border border-neonCyan/20 flex justify-center items-center">
                  <FileText size={18} className="mr-2" />
                  Update Profile
                </FuturisticButton>
              </Link>
            </div>
          </FuturisticCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <FuturisticCard className="h-full">
            <h3 className="text-xl font-bold text-softWhite mb-6">Recent Performance</h3>
            <div className="h-48">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-neonCyan"></div>
                </div>
              ) : completedTests.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={scoreData}
                      cx="50%"
                      cy="50%"
                      startAngle={180}
                      endAngle={0}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={0}
                      dataKey="value"
                    >
                      {scoreData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold" fill="#00faff">
                      {Math.round(averageScore)}%
                    </text>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex justify-center items-center h-full">
                  <p className="text-softWhite/60">No performance data available</p>
                </div>
              )}
            </div>
          </FuturisticCard>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
