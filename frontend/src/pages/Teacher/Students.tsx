import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit, 
  Trash2, 
  MailOpen, 
  Save, 
  X, 
  Check 
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import FuturisticCard from '@/components/FuturisticCard';
import FuturisticButton from '@/components/FuturisticButton';
import FuturisticInput from '@/components/FuturisticInput';
import { getStudents, updateStudent, deleteStudent, User } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface EditableStudent extends User {
  isEditing?: boolean;
  editName?: string;
  editEmail?: string;
  editPassword?: string;
}

const TeacherStudents: React.FC = () => {
  const [students, setStudents] = useState<EditableStudent[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<EditableStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    password: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const studentsData = await getStudents();
      setStudents(studentsData);
      setFilteredStudents(studentsData);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch students. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (!query) {
      setFilteredStudents(students);
      return;
    }
    
    const filtered = students.filter(
      student => student.name.toLowerCase().includes(query) || student.email.toLowerCase().includes(query)
    );
    setFilteredStudents(filtered);
  };

  const handleNewStudentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewStudent(prev => ({ ...prev, [name]: value }));
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real implementation, we would call an API to add a new student
    // For now, we'll just simulate adding to the local state
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate fake ID
      const newId = Math.random().toString(36).substring(2, 15);
      
      const newStudentData: User = {
        _id: newId,
        name: newStudent.name,
        email: newStudent.email,
        role: 'student'
      };
      
      setStudents(prev => [newStudentData, ...prev]);
      setFilteredStudents(prev => [newStudentData, ...prev]);
      
      // Reset form
      setNewStudent({
        name: '',
        email: '',
        password: '',
      });
      setShowAddStudent(false);
      
      toast({
        title: 'Success',
        description: 'Student added successfully.',
        variant: 'default',
      });
      
    } catch (error) {
      console.error('Error adding student:', error);
      toast({
        title: 'Error',
        description: 'Failed to add student. Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const toggleEditStudent = (studentId: string) => {
    setStudents(prev => 
      prev.map(student => {
        if (student._id === studentId) {
          return {
            ...student,
            isEditing: !student.isEditing,
            editName: student.name,
            editEmail: student.email,
            editPassword: '',
          };
        }
        return { ...student, isEditing: false };
      })
    );
    
    setFilteredStudents(prev => 
      prev.map(student => {
        if (student._id === studentId) {
          return {
            ...student,
            isEditing: !student.isEditing,
            editName: student.name,
            editEmail: student.email,
            editPassword: '',
          };
        }
        return { ...student, isEditing: false };
      })
    );
  };

  const handleEditStudentChange = (studentId: string, field: string, value: string) => {
    setStudents(prev => 
      prev.map(student => {
        if (student._id === studentId) {
          return { ...student, [field]: value };
        }
        return student;
      })
    );
    
    setFilteredStudents(prev => 
      prev.map(student => {
        if (student._id === studentId) {
          return { ...student, [field]: value };
        }
        return student;
      })
    );
  };

  const handleUpdateStudent = async (studentId: string) => {
    const student = students.find(s => s._id === studentId);
    if (!student) return;
    
    try {
      await updateStudent(
        studentId,
        {
          name: student.editName || student.name,
          email: student.editEmail || student.email,
          password: student.editPassword
        }
      );
      
      setStudents(prev => 
        prev.map(s => {
          if (s._id === studentId) {
            return {
              ...s,
              name: s.editName || s.name,
              email: s.editEmail || s.email,
              isEditing: false,
            };
          }
          return s;
        })
      );
      
      setFilteredStudents(prev => 
        prev.map(s => {
          if (s._id === studentId) {
            return {
              ...s,
              name: s.editName || s.name,
              email: s.editEmail || s.email,
              isEditing: false,
            };
          }
          return s;
        })
      );
      
      toast({
        title: 'Success',
        description: 'Student updated successfully.',
        variant: 'default',
      });
      
    } catch (error) {
      console.error('Error updating student:', error);
      toast({
        title: 'Error',
        description: 'Failed to update student. Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    
    try {
      await deleteStudent(studentId);
      
      setStudents(prev => prev.filter(s => s._id !== studentId));
      setFilteredStudents(prev => prev.filter(s => s._id !== studentId));
      
      toast({
        title: 'Success',
        description: 'Student deleted successfully.',
        variant: 'default',
      });
      
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete student. Please try again later.',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout title="Students Management">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="w-full md:max-w-md">
            <FuturisticInput
              placeholder="Search students..."
              value={searchQuery}
              onChange={handleSearch}
              icon={<Search size={18} />}
            />
          </div>
          <FuturisticButton onClick={() => setShowAddStudent(!showAddStudent)}>
            <UserPlus size={18} className="mr-2" />
            Add New Student
          </FuturisticButton>
        </div>
      </motion.div>

      {showAddStudent && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <FuturisticCard>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-softWhite">Add New Student</h2>
              <button
                onClick={() => setShowAddStudent(false)}
                className="text-softWhite/60 hover:text-softWhite"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm text-softWhite/70 mb-1">
                    Full Name
                  </label>
                  <FuturisticInput
                    id="name"
                    name="name"
                    value={newStudent.name}
                    onChange={handleNewStudentChange}
                    placeholder="John Doe"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm text-softWhite/70 mb-1">
                    Email Address
                  </label>
                  <FuturisticInput
                    id="email"
                    name="email"
                    type="email"
                    value={newStudent.email}
                    onChange={handleNewStudentChange}
                    placeholder="john.doe@example.com"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm text-softWhite/70 mb-1">
                    Password
                  </label>
                  <FuturisticInput
                    id="password"
                    name="password"
                    type="password"
                    value={newStudent.password}
                    onChange={handleNewStudentChange}
                    placeholder="Create a password"
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <FuturisticButton type="submit">
                  <UserPlus size={18} className="mr-2" />
                  Add Student
                </FuturisticButton>
              </div>
            </form>
          </FuturisticCard>
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neonCyan"></div>
        </div>
      ) : filteredStudents.length === 0 ? (
        <FuturisticCard>
          <div className="text-center py-10">
            <Users className="mx-auto h-12 w-12 text-neonCyan/60 mb-4" />
            <h3 className="text-xl font-semibold text-softWhite mb-2">No Students Found</h3>
            <p className="text-softWhite/60 mb-6">
              {searchQuery 
                ? 'No students match your search criteria.' 
                : 'You haven\'t added any students yet.'}
            </p>
            <FuturisticButton onClick={() => setShowAddStudent(true)}>
              <UserPlus size={18} className="mr-2" />
              Add Your First Student
            </FuturisticButton>
          </div>
        </FuturisticCard>
      ) : (
        <div className="space-y-4">
          {filteredStudents.map((student) => (
            <motion.div
              key={student._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FuturisticCard>
                {student.isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-softWhite/70 mb-1">
                          Full Name
                        </label>
                        <FuturisticInput
                          value={student.editName || ''}
                          onChange={(e) => handleEditStudentChange(student._id, 'editName', e.target.value)}
                          placeholder="Full Name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-softWhite/70 mb-1">
                          Email Address
                        </label>
                        <FuturisticInput
                          value={student.editEmail || ''}
                          onChange={(e) => handleEditStudentChange(student._id, 'editEmail', e.target.value)}
                          placeholder="Email Address"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-softWhite/70 mb-1">
                          New Password (optional)
                        </label>
                        <FuturisticInput
                          type="password"
                          value={student.editPassword || ''}
                          onChange={(e) => handleEditStudentChange(student._id, 'editPassword', e.target.value)}
                          placeholder="New Password"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <FuturisticButton 
                        onClick={() => toggleEditStudent(student._id)}
                        variant="outline"
                      >
                        <X size={16} className="mr-1" />
                        Cancel
                      </FuturisticButton>
                      
                      <FuturisticButton onClick={() => handleUpdateStudent(student._id)}>
                        <Save size={16} className="mr-1" />
                        Save Changes
                      </FuturisticButton>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div className="flex items-center mb-4 md:mb-0">
                      <div className="w-10 h-10 rounded-full bg-deepBlue/70 flex items-center justify-center text-neonCyan mr-4">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-softWhite">{student.name}</h3>
                        <p className="text-sm text-softWhite/70">{student.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <FuturisticButton 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          // In a real implementation, we would send an email to reset password
                          toast({
                            title: 'Email Sent',
                            description: `Password reset email sent to ${student.email}`,
                            variant: 'default',
                          });
                        }}
                      >
                        <MailOpen size={16} className="mr-1" />
                        Send Reset Email
                      </FuturisticButton>
                      
                      <FuturisticButton 
                        size="sm" 
                        variant="outline"
                        onClick={() => toggleEditStudent(student._id)}
                      >
                        <Edit size={16} className="mr-1" />
                        Edit
                      </FuturisticButton>
                      
                      <FuturisticButton 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteStudent(student._id)}
                      >
                        <Trash2 size={16} className="mr-1" />
                        Delete
                      </FuturisticButton>
                    </div>
                  </div>
                )}
              </FuturisticCard>
            </motion.div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default TeacherStudents;
