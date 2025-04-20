import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, FileText, BarChart2, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import FuturisticCard from '@/components/FuturisticCard';
import FuturisticButton from '@/components/FuturisticButton';
import { getUserTests, getStudents, Test, User } from '@/services/api';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

const TeacherDashboard: React.FC = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [testsData, studentsData] = await Promise.all([
          getUserTests(),
          getStudents()
        ]);
        setTests(testsData);
        setStudents(studentsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate test statistics
  const totalTests = tests.length;
  const assignedTests = tests.filter(test => test.status === 'assigned' || test.status === 'active').length;
  const activeTests = tests.filter(test => test.status === 'active').length;
  const totalQuestions = tests.reduce((sum, test) => sum + test.mcqs.length, 0);

  // Prepare data for charts
  const testStatusData = [
    { name: 'Assigned', value: assignedTests, color: '#00faff' },
    { name: 'Created', value: totalTests - assignedTests, color: '#ff007a' },
  ];

  // Get tests with results
  const testsWithResults = tests.filter(test => 
    Object.keys(test.result || {}).length > 0
  );

  // Prepare data for student performance chart
  const studentPerformanceData = testsWithResults.map(test => {
    const totalStudents = Object.keys(test.result).length;
    const passingStudents = Object.values(test.result).filter(
      result => (result.score / result.totalQuestions) >= 0.6
    ).length;
    
    return {
      name: test.test_name.substring(0, 15) + (test.test_name.length > 15 ? '...' : ''),
      passing: passingStudents,
      failing: totalStudents - passingStudents
    };
  }).slice(0, 5); // Get the most recent 5 tests with results

  return (
    <DashboardLayout title="Teacher Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <FuturisticCard className="h-full" hoverable>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-softWhite/60 text-sm mb-1">Total Tests</p>
                <h3 className="text-3xl font-bold text-softWhite">{totalTests}</h3>
              </div>
              <div className="p-3 rounded-full bg-neonCyan/10 text-neonCyan">
                <FileText size={24} />
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
                <p className="text-softWhite/60 text-sm mb-1">Active Tests</p>
                <h3 className="text-3xl font-bold text-softWhite">{activeTests}</h3>
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
                <p className="text-softWhite/60 text-sm mb-1">Total Students</p>
                <h3 className="text-3xl font-bold text-softWhite">{students.length}</h3>
              </div>
              <div className="p-3 rounded-full bg-violet/10 text-violet">
                <Users size={24} />
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
                <p className="text-softWhite/60 text-sm mb-1">Total MCQs</p>
                <h3 className="text-3xl font-bold text-softWhite">{totalQuestions}</h3>
              </div>
              <div className="p-3 rounded-full bg-neonCyan/10 text-neonCyan">
                <CheckCircle size={24} />
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
            <h3 className="text-xl font-bold text-softWhite mb-6">Recent Tests</h3>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-neonCyan"></div>
              </div>
            ) : tests.length > 0 ? (
              <div className="space-y-4">
                {tests.slice(0, 5).map((test, index) => (
                  <div key={index} className="border border-neonCyan/10 rounded-lg p-4 bg-deepBlue/30">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-softWhite">{test.test_name}</h4>
                        <p className="text-sm text-softWhite/60">
                          PDF: {test.pdf_name} • {test.mcqs.length} questions
                        </p>
                        <div className="mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            test.status === 'active' ? 'bg-neonCyan/20 text-neonCyan' : 
                            test.status === 'assigned' ? 'bg-violet/20 text-violet' : 
                            'bg-softWhite/20 text-softWhite/70'
                          }`}>
                            {test.status.toUpperCase()}
                          </span>
                          {test.assigned_to.length > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-softWhite/10 text-softWhite/70 ml-2">
                              {test.assigned_to.length} student{test.assigned_to.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      <Link to={`/teacher/tests/${test.test_name}`}>
                        <FuturisticButton size="sm">
                          Manage
                        </FuturisticButton>
                      </Link>
                    </div>
                  </div>
                ))}

                {tests.length > 5 && (
                  <div className="text-center mt-4">
                    <Link to="/teacher/manage-tests">
                      <FuturisticButton variant="outline" size="sm">
                        View All Tests <ArrowRight size={16} className="ml-1" />
                      </FuturisticButton>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-softWhite/60 mb-4">No tests found</p>
                <Link to="/teacher/mcq-generator">
                  <FuturisticButton size="sm">
                    Create Your First Test
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
            <h3 className="text-xl font-bold text-softWhite mb-6">Test Status</h3>
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
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1A1F2C', 
                        borderRadius: '0.5rem', 
                        border: 'none' 
                      }} 
                    />
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
            <h3 className="text-xl font-bold text-softWhite mb-6">Student Performance</h3>
            <div className="h-64">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-neonCyan"></div>
                </div>
              ) : studentPerformanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={studentPerformanceData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={150} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1A1F2C', 
                        borderRadius: '0.5rem', 
                        border: 'none' 
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="passing" name="Passing" fill="#00faff" />
                    <Bar dataKey="failing" name="Failing" fill="#ff007a" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex justify-center items-center h-full">
                  <p className="text-softWhite/60">No performance data available</p>
                </div>
              )}
            </div>
          </FuturisticCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <FuturisticCard className="h-full">
            <h3 className="text-xl font-bold text-softWhite mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/teacher/mcq-generator" className="w-full">
                <FuturisticButton className="w-full flex justify-center items-center">
                  <FileText size={18} className="mr-2" />
                  Generate MCQs
                </FuturisticButton>
              </Link>
              <Link to="/teacher/manage-tests" className="w-full">
                <FuturisticButton variant="secondary" className="w-full flex justify-center items-center">
                  <BarChart2 size={18} className="mr-2" />
                  Manage Tests
                </FuturisticButton>
              </Link>
              <Link to="/teacher/students" className="w-full">
                <FuturisticButton variant="outline" className="w-full flex justify-center items-center">
                  <Users size={18} className="mr-2" />
                  View Students
                </FuturisticButton>
              </Link>
              <Link to="/teacher/results" className="w-full">
                <FuturisticButton variant="ghost" className="w-full border border-neonCyan/20 flex justify-center items-center">
                  <CheckCircle size={18} className="mr-2" />
                  View Results
                </FuturisticButton>
              </Link>
            </div>

            <div className="mt-8">
              <h4 className="font-medium text-softWhite mb-4">Recent Students</h4>
              {isLoading ? (
                <div className="flex justify-center items-center h-20">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-neonCyan"></div>
                </div>
              ) : students.length > 0 ? (
                <div className="space-y-2">
                  {students.slice(0, 5).map((student, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-deepBlue/30 border border-neonCyan/10">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-neonCyan/20 text-neonCyan flex items-center justify-center mr-3">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-softWhite font-medium">{student.name}</p>
                          <p className="text-xs text-softWhite/60">{student.email}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {students.length > 5 && (
                    <Link to="/teacher/students" className="text-neonCyan text-sm hover:underline flex items-center justify-end mt-2">
                      View all students
                      <ArrowRight size={14} className="ml-1" />
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-softWhite/60">No students found</p>
                </div>
              )}
            </div>
          </FuturisticCard>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
