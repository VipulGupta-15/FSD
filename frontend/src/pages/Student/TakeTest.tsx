import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import DashboardLayout from '@/components/DashboardLayout';
import FuturisticCard from '@/components/FuturisticCard';
import FuturisticButton from '@/components/FuturisticButton';
import { getUserTests, saveTestResult, Test, TestResult } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface QuestionState {
  answer: string | null;
}

const IST_TIMEZONE = 'Asia/Kolkata';
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const TakeTest: React.FC = () => {
  const { testName } = useParams<{ testName: string }>();
  const [test, setTest] = useState<Test | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState<QuestionState[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTest = async () => {
      if (!testName) {
        toast({
          title: "Error",
          description: "No test name provided.",
          variant: "destructive",
        });
        navigate('/student/tests');
        return;
      }

      try {
        setIsLoading(true);
        console.log(`Fetching test: ${testName}`);
        const testsData = await getUserTests({ test_name: testName });
        console.log('Tests data:', testsData);

        if (!testsData || testsData.length === 0) {
          throw new Error("The test you're looking for doesn't exist or you don't have access to it.");
        }

        const fetchedTest = testsData[0];
        const now = new Date();
        const userId = localStorage.getItem('userId') || '';

        // Check if test is student-generated (user_id matches current user)
        const isStudentGenerated = fetchedTest.user_id === userId;

        if (!isStudentGenerated) {
          // Teacher-assigned test: validate start_time and end_time
          let startTime = fetchedTest.start_time ? new Date(fetchedTest.start_time) : null;
          let endTime = fetchedTest.end_time ? new Date(fetchedTest.end_time) : null;

          if (!startTime || !endTime) {
            throw new Error("This test has no scheduled start or end time.");
          }

          if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
            throw new Error("Invalid start or end time format.");
          }

          if (now < startTime) {
            throw new Error(
              `This test starts at ${formatInTimeZone(startTime, IST_TIMEZONE, 'yyyy-MM-dd HH:mm:ss')}.`
            );
          }

          if (now > endTime) {
            throw new Error(
              `This test ended at ${formatInTimeZone(endTime, IST_TIMEZONE, 'yyyy-MM-dd HH:mm:ss')}.`
            );
          }

          // Set time remaining based on end_time
          const timeLeft = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));
          setTimeRemaining(timeLeft);
        } else {
          // Student-generated test: use duration for timer
          if (!fetchedTest.duration) {
            throw new Error("This test has no duration defined.");
          }
          const timeLeft = fetchedTest.duration * 60; // Convert minutes to seconds
          setTimeRemaining(timeLeft);
        }

        if (fetchedTest.result && fetchedTest.result[userId]) {
          throw new Error("You have already completed this test.");
        }

        setTest(fetchedTest);
        setQuestions(fetchedTest.mcqs.map(() => ({ answer: null })));
        setStartTime(new Date());

      } catch (error: any) {
        console.error('Error fetching test:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to load the test. Please try again later.",
          variant: "destructive",
        });
        navigate('/student/tests');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTest();

    return () => {
      if (startTime && !testCompleted && test) {
        console.log('User left the test without completing it.');
      }
    };
  }, [testName, toast, navigate]);

  useEffect(() => {
    if (timeRemaining === null || testCompleted || isSubmitting) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
          if (!testCompleted && !isSubmitting) {
            handleSubmit();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, testCompleted, isSubmitting]);

  const handleAnswerSelect = (answer: string) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[currentQuestion] = { answer };
      return updated;
    });
  };

  const navigateToQuestion = (index: number) => {
    if (test && index >= 0 && index < test.mcqs.length) {
      setCurrentQuestion(index);
    }
  };

  const handleSubmit = async () => {
    if (!test || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const answers: Record<number, string> = {};
      let score = 0;

      questions.forEach((q, index) => {
        if (q.answer) {
          answers[index] = q.answer;
          if (q.answer === test.mcqs[index].correct_answer) {
            score++;
          }
        }
      });

      const timeSpent = startTime
        ? Math.floor((new Date().getTime() - startTime.getTime()) / 1000)
        : 0;

      const result: TestResult = {
        score,
        totalQuestions: test.mcqs.length,
        answers,
        timeSpent,
      };

      console.log('Submitting test:', { test_name: test.test_name, result });

      await saveTestResult(test.test_name, result);

      setTestCompleted(true);
      toast({
        title: "Test completed",
        description: "Your answers have been submitted successfully!",
        variant: "default",
      });
      navigate(`/student/results/${test.test_name}`);
    } catch (error: any) {
      console.error('Error submitting test:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit your answers. Please try again or contact support.",
        variant: "destructive",
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
            <p className="text-softWhite/60 mb-4">The test you're looking for does not exist or you don't have access to it.</p>
            <Link to="/student/tests">
              <FuturisticButton>
                Back to Tests
              </FuturisticButton>
            </Link>
          </div>
        </FuturisticCard>
      </DashboardLayout>
    );
  }

  if (testCompleted) {
    return (
      <DashboardLayout title="Test Completed">
        <FuturisticCard>
          <div className="text-center py-10">
            <CheckCircle className="mx-auto h-16 w-16 text-neonCyan mb-4" />
            <h2 className="text-2xl font-bold text-softWhite mb-2">Test Completed</h2>
            <p className="text-softWhite/70 mb-6">
              Your answers have been submitted successfully. You can now view your results.
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <Link to={`/student/results/${test.test_name}`}>
                <FuturisticButton>
                  View Results
                </FuturisticButton>
              </Link>
              <Link to="/student/tests">
                <FuturisticButton variant="outline">
                  Back to Tests
                </FuturisticButton>
              </Link>
            </div>
          </div>
        </FuturisticCard>
      </DashboardLayout>
    );
  }

  const currentMcq = test.mcqs[currentQuestion];
  const answeredCount = questions.filter((q) => q.answer !== null).length;
  const formattedTime =
    timeRemaining !== null
      ? `${Math.floor(timeRemaining / 60)}:${(timeRemaining % 60).toString().padStart(2, '0')}`
      : 'No time limit';

  // Add safe rendering for MCQ difficulty
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'hard':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <DashboardLayout title={`Test: ${test?.test_name || 'Loading...'}`}>
      {isLoading ? (
        <div className="mb-4 flex justify-between items-center">
          <Link to="/student/tests" className="text-neonCyan hover:underline flex items-center">
            <ArrowLeft size={16} className="mr-1" />
            Exit Test
          </Link>
          <div className="flex items-center bg-deepBlue/50 px-4 py-2 rounded-lg">
            <Clock size={16} className="text-neonCyan mr-2" />
            <span className="text-softWhite font-medium">{formattedTime}</span>
          </div>
        </div>
      ) : testCompleted ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <FuturisticCard>
              <h3 className="text-lg font-semibold text-softWhite mb-4">Questions</h3>
              <div className="flex flex-col space-y-2">
                <div className="text-sm text-softWhite/70 mb-2">
                  Answered: {answeredCount} / {test.mcqs.length}
                </div>
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {test.mcqs.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => navigateToQuestion(index)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        index === currentQuestion
                          ? 'bg-neonCyan text-deepBlue font-bold'
                          : questions[index].answer !== null
                          ? 'bg-neonCyan/20 text-neonCyan border border-neonCyan/50'
                          : 'bg-deepBlue/50 text-softWhite/70 border border-softWhite/10'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <FuturisticButton
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="mt-4"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Test'}
                </FuturisticButton>
              </div>
            </FuturisticCard>
          </div>

          <div className="lg:col-span-3">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <FuturisticCard className="h-full">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-softWhite">Question {currentQuestion + 1}</h2>
                  <div className="text-sm text-softWhite/70">
                    Difficulty:{' '}
                    <span
                      className={`${
                        currentMcq.difficulty === 'hard'
                          ? 'text-neonPink'
                          : currentMcq.difficulty === 'medium'
                          ? 'text-violet'
                          : 'text-neonCyan'
                      }`}
                    >
                      {currentMcq.difficulty.charAt(0).toUpperCase() + currentMcq.difficulty.slice(1)}
                    </span>
                  </div>
                </div>

                <p className="text-softWhite text-lg mb-6">{currentMcq.question}</p>

                <div className="space-y-4 mb-8">
                  {currentMcq.options.map((option, index) => (
                    <div
                      key={index}
                      onClick={() => handleAnswerSelect(option)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        questions[currentQuestion].answer === option
                          ? 'border-neonCyan bg-neonCyan/10 text-softWhite'
                          : 'border-softWhite/20 text-softWhite/70 hover:border-softWhite/40'
                      }`}
                    >
                      <div className="flex items-start">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                            questions[currentQuestion].answer === option
                              ? 'bg-neonCyan text-deepBlue'
                              : 'bg-deepBlue border border-softWhite/30'
                          }`}
                        >
                          {String.fromCharCode(65 + index)}
                        </div>
                        <div>{option}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between">
                  <FuturisticButton
                    onClick={() => navigateToQuestion(currentQuestion - 1)}
                    disabled={currentQuestion === 0}
                    variant="outline"
                    className="flex items-center"
                  >
                    <ArrowLeft size={16} className="mr-1" />
                    Previous
                  </FuturisticButton>

                  {currentQuestion < test.mcqs.length - 1 ? (
                    <FuturisticButton
                      onClick={() => navigateToQuestion(currentQuestion + 1)}
                      className="flex items-center"
                    >
                      Next
                      <ArrowRight size={16} className="ml-1" />
                    </FuturisticButton>
                  ) : (
                    <FuturisticButton onClick={handleSubmit} disabled={isSubmitting}>
                      {isSubmitting ? 'Submitting...' : 'Submit Test'}
                    </FuturisticButton>
                  )}
                </div>
              </FuturisticCard>
            </motion.div>
          </div>
        </div>
      ) : (
        <FuturisticCard>
          <div className="text-center py-10">
            <h3 className="text-xl font-semibold text-softWhite mb-2">Test Not Found</h3>
            <p className="text-softWhite/60 mb-6">The test you're looking for could not be found.</p>
            <Link to="/student/tests">
              <FuturisticButton>Back to Tests</FuturisticButton>
            </Link>
          </div>
        </FuturisticCard>
      )}
    </DashboardLayout>
  );
};

export default TakeTest;