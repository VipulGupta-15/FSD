import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Calendar, Clock, PlayCircle, StopCircle, Save, Plus } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import FuturisticCard from '@/components/FuturisticCard';
import FuturisticButton from '@/components/FuturisticButton';
import FuturisticInput from '@/components/FuturisticInput';
import { getUserTests, getStudents, assignTest, manageTest, Test, User } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const TestDetail: React.FC = () => {
  const { testName } = useParams<{ testName: string }>();
  const [test, setTest] = useState<Test | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
          navigate('/teacher/manage-tests');
          return;
        }
        setTest(testsData[0]);
        
        if (testsData[0].assigned_to.length > 0) {
          setSelectedStudents(testsData[0].assigned_to);
        }
        
        if (testsData[0].start_time) {
          // Convert ISO to datetime-local format (YYYY-MM-DDThh:mm)
          const startDate = new Date(testsData[0].start_time);
          setStartTime(startDate.toISOString().slice(0, 16));
        }
        
        if (testsData[0].end_time) {
          const endDate = new Date(testsData[0].end_time);
          setEndTime(endDate.toISOString().slice(0, 16));
        }
        
        if (testsData[0].duration) {
          setDuration(testsData[0].duration.toString());
        }
        
        // Fetch students
        const studentsData = await getStudents();
        setStudents(studentsData);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch test details. Please try again later.',
          variant: 'destructive',
        });
        navigate('/teacher/manage-tests');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [testName, toast, navigate]);

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAllStudents = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(student => student._id));
    }
  };

  const handleAssignTest = async () => {
    if (selectedStudents.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one student.',
        variant: 'destructive',
      });
      return;
    }

    if (!startTime || !endTime || !duration) {
      toast({
        title: 'Error',
        description: 'Please set start time, end time, and duration.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      await assignTest(
        testName || '',
        selectedStudents,
        startTime,
        endTime,
        parseInt(duration)
      );
      
      toast({
        title: 'Success',
        description: 'Test assigned successfully.',
        variant: 'default',
      });
      
      // Refresh test data
      const testsData = await getUserTests({ test_name: testName });
      if (testsData.length > 0) {
        setTest(testsData[0]);
      }
      
    } catch (error) {
      console.error('Error assigning test:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign test. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartTest = async () => {
    if (!test) return;
    
    try {
      setIsSubmitting(true);
      await manageTest(test.test_name, 'start');
      
      toast({
        title: 'Success',
        description: 'Test started successfully.',
        variant: 'default',
      });
      
      // Refresh test data
      const testsData = await getUserTests({ test_name: testName });
      if (testsData.length > 0) {
        setTest(testsData[0]);
      }
      
    } catch (error) {
      console.error('Error starting test:', error);
      toast({
        title: 'Error',
        description: 'Failed to start test. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStopTest = async () => {
    if (!test) return;
    
    try {
      setIsSubmitting(true);
      await manageTest(test.test_name, 'stop');
      
      toast({
        title: 'Success',
        description: 'Test stopped successfully.',
        variant: 'default',
      });
      
      // Refresh test data
      const testsData = await getUserTests({ test_name: testName });
      if (testsData.length > 0) {
        setTest(testsData[0]);
      }
      
    } catch (error) {
      console.error('Error stopping test:', error);
      toast({
        title: 'Error',
        description: 'Failed to stop test. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Loading Test...">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neonCyan"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!test) {
    return (
      <DashboardLayout title="Test Not Found">
        <FuturisticCard>
          <div className="text-center py-10">
            <p className="text-softWhite/60 mb-4">The test you're looking for does not exist.</p>
            <Link to="/teacher/manage-tests">
              <FuturisticButton>
                Back to Tests
              </FuturisticButton>
            </Link>
          </div>
        </FuturisticCard>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Test: ${test.test_name}`}>
      <div className="mb-6 flex items-center">
        <Link to="/teacher/manage-tests" className="text-neonCyan hover:underline flex items-center">
          <ArrowLeft size={16} className="mr-1" />
          Back to Tests
        </Link>
        <div className={`ml-4 px-3 py-1 rounded-full text-xs ${
          test.status === 'active' ? 'bg-neonCyan/20 text-neonCyan' : 
          test.status === 'assigned' ? 'bg-violet/20 text-violet' : 
          test.status === 'stopped' ? 'bg-neonPink/20 text-neonPink' : 
          'bg-softWhite/20 text-softWhite/70'
        }`}>
          {test.status.toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-2"
        >
          <FuturisticCard>
            <h2 className="text-xl font-bold text-softWhite mb-4">Test Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-softWhite/60 mb-1">Test Name</p>
                <p className="text-lg text-softWhite">{test.test_name}</p>
              </div>
              <div>
                <p className="text-sm text-softWhite/60 mb-1">Source PDF</p>
                <p className="text-lg text-softWhite">{test.pdf_name}</p>
              </div>
              <div>
                <p className="text-sm text-softWhite/60 mb-1">Questions</p>
                <p className="text-lg text-softWhite">{test.mcqs.length} multiple choice questions</p>
              </div>
              <div>
                <p className="text-sm text-softWhite/60 mb-1">Created At</p>
                <p className="text-lg text-softWhite">
                  {new Date(test.created_at).toLocaleDateString()} {new Date(test.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-neonCyan/10">
              <h3 className="text-lg font-semibold text-softWhite mb-4">Test Management</h3>
              <div className="flex flex-wrap gap-3">
                {test.status === 'assigned' && (
                  <FuturisticButton
                    onClick={handleStartTest}
                    disabled={isSubmitting}
                  >
                    <PlayCircle size={18} className="mr-2" />
                    Start Test
                  </FuturisticButton>
                )}
                
                {test.status === 'active' && (
                  <FuturisticButton
                    onClick={handleStopTest}
                    variant="primary"
                    disabled={isSubmitting}
                  >
                    <StopCircle size={18} className="mr-2" />
                    Stop Test
                  </FuturisticButton>
                )}
                
                <Link to={`/teacher/results/${test.test_name}`}>
                  <FuturisticButton variant="outline">
                    View Results
                  </FuturisticButton>
                </Link>
              </div>
            </div>
          </FuturisticCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <FuturisticCard>
            <h2 className="text-xl font-bold text-softWhite mb-4">Assignment Status</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-softWhite/60 mb-1">Students Assigned</p>
                <p className="text-lg text-softWhite">{test.assigned_to.length} students</p>
              </div>
              
              {test.start_time && (
                <div>
                  <p className="text-sm text-softWhite/60 mb-1">Start Time</p>
                  <p className="text-lg text-softWhite">
                    {new Date(test.start_time).toLocaleDateString()} {new Date(test.start_time).toLocaleTimeString()}
                  </p>
                </div>
              )}
              
              {test.end_time && (
                <div>
                  <p className="text-sm text-softWhite/60 mb-1">End Time</p>
                  <p className="text-lg text-softWhite">
                    {new Date(test.end_time).toLocaleDateString()} {new Date(test.end_time).toLocaleTimeString()}
                  </p>
                </div>
              )}
              
              {test.duration && (
                <div>
                  <p className="text-sm text-softWhite/60 mb-1">Duration</p>
                  <p className="text-lg text-softWhite">{test.duration} minutes</p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-softWhite/60 mb-1">Completed By</p>
                <p className="text-lg text-softWhite">
                  {test.result ? Object.keys(test.result).length : 0} of {test.assigned_to.length} students
                </p>
              </div>
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
          <h2 className="text-xl font-bold text-softWhite mb-6">Assign Test</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="flex items-center mb-4">
                <Calendar size={18} className="text-neonCyan mr-2" />
                <h3 className="text-lg font-semibold text-softWhite">Schedule</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-softWhite/70 mb-2">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    id="startTime"
                    className="bg-deepBlue/50 border border-neonCyan/30 rounded-lg px-4 py-2 w-full text-softWhite focus:outline-none focus:ring-2 focus:ring-neonCyan/50"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-softWhite/70 mb-2">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    id="endTime"
                    className="bg-deepBlue/50 border border-neonCyan/30 rounded-lg px-4 py-2 w-full text-softWhite focus:outline-none focus:ring-2 focus:ring-neonCyan/50"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-softWhite/70 mb-2">
                    Duration (minutes)
                  </label>
                  <FuturisticInput
                    id="duration"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    icon={<Clock size={18} />}
                    min="1"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Users size={18} className="text-neonCyan mr-2" />
                  <h3 className="text-lg font-semibold text-softWhite">Students</h3>
                </div>
                <button
                  onClick={handleSelectAllStudents}
                  className="text-sm text-neonCyan hover:underline"
                >
                  {selectedStudents.length === students.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              
              <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
                {students.length === 0 ? (
                  <p className="text-softWhite/60">No students available.</p>
                ) : (
                  students.map((student) => (
                    <div
                      key={student._id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        selectedStudents.includes(student._id)
                          ? 'border-neonCyan bg-neonCyan/10'
                          : 'border-softWhite/20 hover:border-softWhite/40'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-deepBlue/70 flex items-center justify-center mr-3">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-softWhite">{student.name}</p>
                          <p className="text-xs text-softWhite/60">{student.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleStudentToggle(student._id)}
                        className={`w-6 h-6 rounded-md flex items-center justify-center ${
                          selectedStudents.includes(student._id)
                            ? 'bg-neonCyan text-deepBlue'
                            : 'bg-deepBlue/50 text-softWhite/70 border border-softWhite/30'
                        }`}
                      >
                        {selectedStudents.includes(student._id) ? '✓' : ''}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <FuturisticButton 
              onClick={handleAssignTest} 
              disabled={isSubmitting || selectedStudents.length === 0 || !startTime || !endTime || !duration}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-deepBlue mr-2"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center">
                  <Save size={18} className="mr-2" />
                  {test.assigned_to.length > 0 ? 'Update Assignment' : 'Assign Test'}
                </div>
              )}
            </FuturisticButton>
          </div>
        </FuturisticCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="mt-6"
      >
        <FuturisticCard>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-softWhite">Test Questions</h2>
            <Link to="/teacher/mcq-generator">
              <FuturisticButton variant="outline" size="sm">
                <Plus size={16} className="mr-1" />
                Generate New Test
              </FuturisticButton>
            </Link>
          </div>
          
          <div className="space-y-6">
            {test.mcqs.map((mcq, index) => (
              <div key={index} className="p-4 rounded-lg border border-neonCyan/20 bg-deepBlue/30">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-softWhite">Question {index + 1}</h3>
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    mcq.difficulty === 'easy' ? 'bg-neonCyan/20 text-neonCyan' :
                    mcq.difficulty === 'medium' ? 'bg-violet/20 text-violet' :
                    'bg-neonPink/20 text-neonPink'
                  }`}>
                    {mcq.difficulty.toUpperCase()}
                  </div>
                </div>
                
                <p className="text-softWhite mb-4">{mcq.question}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {mcq.options.map((option, optIndex) => (
                    <div 
                      key={optIndex}
                      className={`p-3 rounded-lg ${
                        option === mcq.correct_answer
                          ? 'bg-neonCyan/10 border border-neonCyan text-softWhite'
                          : 'bg-deepBlue/50 border border-softWhite/20 text-softWhite/70'
                      }`}
                    >
                      {option}
                      {option === mcq.correct_answer && (
                        <span className="ml-2 text-xs text-neonCyan">(Correct Answer)</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </FuturisticCard>
      </motion.div>
    </DashboardLayout>
  );
};

export default TestDetail;
