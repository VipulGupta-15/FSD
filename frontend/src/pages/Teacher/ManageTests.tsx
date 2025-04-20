import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Clock, 
  FileText, 
  Users, 
  CheckCircle, 
  XCircle, 
  Edit, 
  PlayCircle,
  StopCircle,
  Search, 
  PlusCircle,
  BarChart2,
  Trash2,
  Calendar
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import FuturisticCard from '@/components/FuturisticCard';
import FuturisticButton from '@/components/FuturisticButton';
import FuturisticInput from '@/components/FuturisticInput';
import { getUserTests, manageTest, Test } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { formatInTimeZone } from 'date-fns-tz';

const IST_TIMEZONE = 'Asia/Kolkata';
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const ManageTests: React.FC = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [filteredTests, setFilteredTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'assigned' | 'stopped' | 'generated'>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setIsLoading(true);
      const testsData = await getUserTests();
      setTests(testsData);
      applyFilters(testsData, activeTab, searchQuery);
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

  const applyFilters = (testsData: Test[], tab: string, query: string) => {
    let filtered = [...testsData];
    
    if (tab !== 'all') {
      filtered = filtered.filter(test => test.status === tab);
    }
    
    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(
        test => 
          test.test_name.toLowerCase().includes(lowerQuery) || 
          test.pdf_name.toLowerCase().includes(lowerQuery)
      );
    }
    
    setFilteredTests(filtered);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    applyFilters(tests, activeTab, query);
  };

  const handleTabChange = (tab: 'all' | 'active' | 'assigned' | 'stopped' | 'generated') => {
    setActiveTab(tab);
    applyFilters(tests, tab, searchQuery);
  };

  const handleStartTest = async (testName: string) => {
    try {
      await manageTest(testName, 'start');
      toast({
        title: 'Success',
        description: 'Test has been started successfully.',
        variant: 'default',
      });
      fetchTests();
    } catch (error) {
      console.error('Error starting test:', error);
      toast({
        title: 'Error',
        description: 'Failed to start test. Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const handleStopTest = async (testName: string) => {
    try {
      await manageTest(testName, 'stop');
      toast({
        title: 'Success',
        description: 'Test has been stopped successfully.',
        variant: 'default',
      });
      fetchTests();
    } catch (error) {
      console.error('Error stopping test:', error);
      toast({
        title: 'Error',
        description: 'Failed to stop test. Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTest = async (testName: string) => {
    if (!confirm(`Are you sure you want to delete the test "${testName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/delete-test`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test_name: testName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete test');
      }

      toast({
        title: 'Success',
        description: `Test "${testName}" deleted successfully.`,
        variant: 'default',
      });
      fetchTests();
    } catch (error: any) {
      console.error('Error deleting test:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete test. Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const formatISTDateTime = (isoString: string | null | undefined) => {
    if (!isoString) return 'N/A';
    try {
      return formatInTimeZone(isoString, IST_TIMEZONE, 'dd MMM yyyy, hh:mm a');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  return (
    <DashboardLayout title="Manage Tests">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="w-full md:max-w-md">
            <FuturisticInput
              placeholder="Search tests..."
              value={searchQuery}
              onChange={handleSearch}
              icon={<Search size={18} />}
            />
          </div>
          <Link to="/teacher/mcq-generator">
            <FuturisticButton className="whitespace-nowrap">
              <PlusCircle size={18} className="mr-2" />
              Create New Test
            </FuturisticButton>
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex overflow-x-auto space-x-2 pb-2">
          {['all', 'generated', 'assigned', 'active', 'stopped'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab as 'all' | 'active' | 'assigned' | 'stopped' | 'generated')}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-neonCyan text-deepBlue font-medium' 
                  : 'bg-deepBlue/30 text-softWhite/70 hover:bg-deepBlue/50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} Tests
            </button>
          ))}
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neonCyan"></div>
        </div>
      ) : filteredTests.length === 0 ? (
        <FuturisticCard>
          <div className="text-center py-10">
            <FileText className="mx-auto h-12 w-12 text-neonCyan/60 mb-4" />
            <h3 className="text-xl font-semibold text-softWhite mb-2">No Tests Found</h3>
            <p className="text-softWhite/60 mb-6">
              {activeTab !== 'all' 
                ? `You don't have any ${activeTab} tests yet.` 
                : searchQuery 
                  ? 'No tests match your search criteria.' 
                  : 'You haven\'t created any tests yet.'}
            </p>
            <Link to="/teacher/mcq-generator">
              <FuturisticButton>
                Create Your First Test
              </FuturisticButton>
            </Link>
          </div>
        </FuturisticCard>
      ) : (
        <div className="space-y-6">
          {filteredTests.map((test, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + (index * 0.05) }}
            >
              <FuturisticCard 
                className={`border-l-4 ${
                  test.status === 'active' ? 'border-neonCyan' : 
                  test.status === 'assigned' ? 'border-violet' : 
                  test.status === 'stopped' ? 'border-neonPink/70' : 
                  test.status === 'generated' ? 'border-softWhite/50' :
                  'border-softWhite/30'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-xl font-bold text-softWhite">{test.test_name}</h3>
                      <div className={`ml-3 px-3 py-1 rounded-full text-xs ${
                        test.status === 'active' ? 'bg-neonCyan/20 text-neonCyan' : 
                        test.status === 'assigned' ? 'bg-violet/20 text-violet' : 
                        test.status === 'stopped' ? 'bg-neonPink/20 text-neonPink' : 
                        test.status === 'generated' ? 'bg-softWhite/30 text-softWhite' :
                        'bg-softWhite/20 text-softWhite/70'
                      }`}>
                        {test.status.toUpperCase()}
                      </div>
                    </div>
                    
                    <p className="text-softWhite/70 mb-2">
                      <span className="font-medium">Source:</span> {test.pdf_name}
                    </p>
                    
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-softWhite/70 mb-4">
                      <div className="flex items-center">
                        <FileText size={16} className="mr-1" />
                        {test.mcqs.length} questions
                      </div>
                      
                      <div className="flex items-center">
                        <Users size={16} className="mr-1" />
                        {test.assigned_to.length} students assigned
                      </div>
                      
                      <div className="flex items-center">
                        <Clock size={16} className="mr-1" />
                        Duration: {test.duration || 'N/A'} minutes
                      </div>
                      
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-1" />
                        Starts: {formatISTDateTime(test.start_time)}
                      </div>
                      
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-1" />
                        Ends: {formatISTDateTime(test.end_time)}
                      </div>
                      
                      <div className="flex items-center">
                        {test.result && Object.keys(test.result).length > 0 ? (
                          <>
                            <CheckCircle size={16} className="mr-1 text-neonCyan" />
                            {Object.keys(test.result).length} completed
                          </>
                        ) : (
                          <>
                            <XCircle size={16} className="mr-1 text-neonPink/70" />
                            No submissions yet
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 justify-end">
                    <Link to={`/teacher/tests/${test.test_name}`}>
                      <FuturisticButton variant="outline" size="sm">
                        <Edit size={16} className="mr-1" />
                        Edit
                      </FuturisticButton>
                    </Link>
                    
                    {test.status === 'assigned' && (
                      <FuturisticButton
                        onClick={() => handleStartTest(test.test_name)}
                        size="sm"
                      >
                        <PlayCircle size={16} className="mr-1" />
                        Start Test
                      </FuturisticButton>
                    )}
                    
                    {test.status === 'active' && (
                      <FuturisticButton
                        onClick={() => handleStopTest(test.test_name)}
                        variant="outline"
                        size="sm"
                      >
                        <StopCircle size={16} className="mr-1" />
                        Stop Test
                      </FuturisticButton>
                    )}
                    
                    <Link to={`/teacher/results/${test.test_name}`}>
                      <FuturisticButton
                        variant={test.result && Object.keys(test.result).length > 0 ? 'primary' : 'ghost'}
                        size="sm"
                      >
                        <BarChart2 size={16} className="mr-1" />
                        View Results
                      </FuturisticButton>
                    </Link>

                    {test.status === 'generated' && (
                      <FuturisticButton
                        onClick={() => handleDeleteTest(test.test_name)}
                        variant="outline"
                        size="sm"
                        className="bg-neonPink/10 text-neonPink hover:bg-neonPink/20"
                      >
                        <Trash2 size={16} className="mr-1" />
                        Delete
                      </FuturisticButton>
                    )}
                  </div>
                </div>
              </FuturisticCard>
            </motion.div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default ManageTests;