import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, FileText, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import FuturisticCard from '@/components/FuturisticCard';
import FuturisticButton from '@/components/FuturisticButton';
import { getUserTests, Test } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const StudentTests: React.FC = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setIsLoading(true);
        const testsData = await getUserTests();
        // Filter tests that are assigned to this student
        const assignedTests = testsData.filter(
          test => test.assigned_to.includes(localStorage.getItem('userId') || '')
        );
        setTests(assignedTests);
      } catch (error) {
        console.error('Error fetching tests:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch tests. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTests();
  }, [toast]);

  // Group tests by status
  const pendingTests = tests.filter(test => 
    test.status === 'assigned' && !test.result[localStorage.getItem('userId') || '']
  );
  
  const activeTests = tests.filter(test => 
    test.status === 'active' && !test.result[localStorage.getItem('userId') || '']
  );
  
  const completedTests = tests.filter(test => 
    test.result[localStorage.getItem('userId') || '']
  );

  return (
    <DashboardLayout title="My Tests">
      <div className="space-y-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neonCyan"></div>
          </div>
        ) : tests.length === 0 ? (
          <FuturisticCard>
            <div className="text-center py-10">
              <AlertCircle className="mx-auto h-12 w-12 text-neonCyan/60 mb-4" />
              <h3 className="text-xl font-semibold text-softWhite mb-2">No Tests Found</h3>
              <p className="text-softWhite/60 mb-6">You don't have any tests assigned to you yet.</p>
              <Link to="/student/generate-mcqs">
                <FuturisticButton>
                  Generate Your Own MCQs
                </FuturisticButton>
              </Link>
            </div>
          </FuturisticCard>
        ) : (
          <>
            {/* Active Tests Section */}
            {activeTests.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-softWhite mb-4">Active Tests</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {activeTests.map((test, index) => (
                    <FuturisticCard key={index} className="border-l-4 border-neonCyan">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-softWhite">{test.test_name}</h3>
                        <div className="px-3 py-1 rounded-full bg-neonCyan/20 text-neonCyan text-xs">
                          ACTIVE
                        </div>
                      </div>
                      <p className="text-softWhite/70 mb-2">
                        <span className="font-medium">Source:</span> {test.pdf_name}
                      </p>
                      <div className="flex items-center text-softWhite/70 mb-4">
                        <Clock size={16} className="mr-1" />
                        <span className="text-sm">
                          Duration: {test.duration} minutes • {test.mcqs.length} questions
                        </span>
                      </div>
                      <Link to={`/student/take-test/${test.test_name}`}>
                        <FuturisticButton className="w-full">
                          Take Test Now
                        </FuturisticButton>
                      </Link>
                    </FuturisticCard>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Pending Tests Section */}
            {pendingTests.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <h2 className="text-2xl font-bold text-softWhite mb-4">Pending Tests</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {pendingTests.map((test, index) => (
                    <FuturisticCard key={index} className="border-l-4 border-violet/70">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-softWhite">{test.test_name}</h3>
                        <div className="px-3 py-1 rounded-full bg-violet/20 text-violet text-xs">
                          PENDING
                        </div>
                      </div>
                      <p className="text-softWhite/70 mb-2">
                        <span className="font-medium">Source:</span> {test.pdf_name}
                      </p>
                      <div className="flex items-center text-softWhite/70 mb-2">
                        <Clock size={16} className="mr-1" />
                        <span className="text-sm">
                          Duration: {test.duration} minutes • {test.mcqs.length} questions
                        </span>
                      </div>
                      <p className="text-softWhite/70 text-sm mb-4">
                        <span className="font-medium">Status:</span> Waiting for teacher to activate
                      </p>
                      <FuturisticButton className="w-full" variant="outline" disabled>
                        Not Available Yet
                      </FuturisticButton>
                    </FuturisticCard>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Completed Tests Section */}
            {completedTests.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <h2 className="text-2xl font-bold text-softWhite mb-4">Completed Tests</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {completedTests.map((test, index) => {
                    const result = test.result[localStorage.getItem('userId') || ''];
                    const score = result ? Math.round((result.score / result.totalQuestions) * 100) : 0;
                    
                    return (
                      <FuturisticCard key={index} className="border-l-4 border-softWhite/30">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-bold text-softWhite">{test.test_name}</h3>
                          <div className="px-3 py-1 rounded-full bg-softWhite/20 text-softWhite text-xs">
                            COMPLETED
                          </div>
                        </div>
                        <p className="text-softWhite/70 mb-2">
                          <span className="font-medium">Source:</span> {test.pdf_name}
                        </p>
                        <div className="flex justify-between items-center mb-4">
                          <div className="text-softWhite/70 text-sm">
                            <FileText size={16} className="inline mr-1" />
                            {test.mcqs.length} questions
                          </div>
                          <div className={`text-sm font-medium ${
                            score >= 70 ? 'text-neonCyan' : 
                            score >= 40 ? 'text-violet' : 'text-neonPink'
                          }`}>
                            Score: {score}%
                          </div>
                        </div>
                        <Link to={`/student/results/${test.test_name}`}>
                          <FuturisticButton className="w-full" variant="outline">
                            View Results
                          </FuturisticButton>
                        </Link>
                      </FuturisticCard>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentTests;
