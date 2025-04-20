import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  FileText, 
  BarChart2, 
  Clock, 
  Users, 
  CheckCircle,
  ChevronRight,
  Brain,
  Target
} from 'lucide-react';
import ParticleBackground from '@/components/ParticleBackground';
import FuturisticButton from '@/components/FuturisticButton';
import FuturisticCard from '@/components/FuturisticCard';

const features = [
  {
    icon: <FileText className="text-neonCyan" size={32} />,
    title: "PDF-to-MCQs Conversion",
    description: "Instantly generate relevant MCQs from your PDF documents with AI precision"
  },
  {
    icon: <Target className="text-neonCyan" size={32} />,
    title: "Difficulty Control",
    description: "Choose easy, medium, or hard questions to match your learning objectives"
  },
  {
    icon: <Brain className="text-neonCyan" size={32} />,
    title: "Smart Relevance Scoring",
    description: "Our AI ensures questions are actually relevant to your content"
  },
  {
    icon: <BarChart2 className="text-neonCyan" size={32} />,
    title: "Detailed Analytics",
    description: "Track performance with comprehensive visual reports and insights"
  },
  {
    icon: <Users className="text-neonCyan" size={32} />,
    title: "Teacher-Student Integration",
    description: "Seamlessly assign tests and track student progress in real-time"
  },
  {
    icon: <Clock className="text-neonCyan" size={32} />,
    title: "Timed Assessments",
    description: "Set duration and deadlines for tests with automated submissions"
  }
];

const howItWorks = [
  {
    number: "01",
    title: "Upload PDF",
    description: "Simply upload your study material in PDF format"
  },
  {
    number: "02",
    title: "Generate Questions",
    description: "Our AI analyzes content and creates relevant MCQs"
  },
  {
    number: "03",
    title: "Review & Customize",
    description: "Edit questions or regenerate based on your needs"
  },
  {
    number: "04",
    title: "Assign & Analyze",
    description: "Share with students and track results visually"
  }
];

const testimonials = [
  {
    quote: "MCQGenius transformed how I prepare assessments. What used to take hours now takes minutes!",
    author: "Dr. Sarah Johnson",
    role: "University Professor"
  },
  {
    quote: "The relevance of the generated questions is impressive. It actually understands the content!",
    author: "Michael Chen",
    role: "High School Teacher"
  },
  {
    quote: "As a student, this helped me create practice tests from my notes and improved my exam scores.",
    author: "Aisha Patel",
    role: "Medical Student"
  }
];

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ParticleBackground />
      
      {/* Navbar */}
      <nav className="border-b border-neonCyan/10 bg-deepBlue/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold gradient-text">MCQGenius</span>
            </div>
            <div className="hidden md:flex md:items-center md:space-x-8">
              <a href="#features" className="text-softWhite/70 hover:text-softWhite transition-colors">Features</a>
              <a href="#how-it-works" className="text-softWhite/70 hover:text-softWhite transition-colors">How It Works</a>
              <a href="#testimonials" className="text-softWhite/70 hover:text-softWhite transition-colors">Testimonials</a>
              <Link to="/login">
                <FuturisticButton variant="outline" size="sm">
                  Sign In
                </FuturisticButton>
              </Link>
              <Link to="/register">
                <FuturisticButton size="sm">
                  Get Started
                </FuturisticButton>
              </Link>
            </div>
            <div className="md:hidden flex items-center space-x-2">
              <Link to="/login">
                <FuturisticButton variant="outline" size="sm">
                  Sign In
                </FuturisticButton>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <motion.div 
              className="lg:w-1/2 mb-12 lg:mb-0 text-center lg:text-left"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                <span className="gradient-text">Empower Learning</span> <br />
                Through AI-Powered <br />
                MCQ Generation
              </h1>
              <p className="text-lg md:text-xl text-softWhite/70 mb-8 max-w-xl mx-auto lg:mx-0">
                Seamlessly generate, review, and assign multiple-choice questions from any PDF with our cutting-edge AI technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/register">
                  <FuturisticButton size="lg" className="w-full sm:w-auto">
                    Get Started Free
                  </FuturisticButton>
                </Link>
                <a href="#how-it-works">
                  <FuturisticButton variant="outline" size="lg" className="w-full sm:w-auto">
                    How It Works
                  </FuturisticButton>
                </a>
              </div>
            </motion.div>
            
            <motion.div 
              className="lg:w-1/2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-neonCyan to-neonPink rounded-2xl blur opacity-30"></div>
                <div className="relative bg-deepBlue/90 rounded-2xl border border-white/10 shadow-xl overflow-hidden">
                  <div className="p-6 border-b border-neonCyan/10">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-neonPink mr-2"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-400 mr-2"></div>
                      <div className="h-3 w-3 rounded-full bg-neonCyan"></div>
                      <div className="ml-4 text-sm text-softWhite/70">MCQ Generator</div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="text-sm text-softWhite/70 mb-2">Generated Question:</div>
                    <div className="text-softWhite mb-6 p-4 rounded-lg bg-white/5 border border-neonCyan/10">
                      Which principle is central to the quantum theory of light?
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center p-3 rounded-lg bg-white/5 border border-neonCyan/10 hover:bg-neonCyan/5 transition-colors">
                        <div className="h-5 w-5 rounded-full border-2 border-neonCyan/50 mr-3 flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-neonCyan"></div>
                        </div>
                        <span>Wave-particle duality</span>
                      </div>
                      
                      <div className="flex items-center p-3 rounded-lg bg-white/5 border border-neonCyan/10 hover:bg-neonCyan/5 transition-colors">
                        <div className="h-5 w-5 rounded-full border-2 border-softWhite/30 mr-3"></div>
                        <span>Newton's third law</span>
                      </div>
                      
                      <div className="flex items-center p-3 rounded-lg bg-white/5 border border-neonCyan/10 hover:bg-neonCyan/5 transition-colors">
                        <div className="h-5 w-5 rounded-full border-2 border-softWhite/30 mr-3"></div>
                        <span>Theory of relativity</span>
                      </div>
                      
                      <div className="flex items-center p-3 rounded-lg bg-white/5 border border-neonCyan/10 hover:bg-neonCyan/5 transition-colors">
                        <div className="h-5 w-5 rounded-full border-2 border-softWhite/30 mr-3"></div>
                        <span>Boyle's law</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-between">
                      <div className="text-sm">
                        <span className="text-softWhite/50">Difficulty:</span>
                        <span className="ml-2 text-neonCyan">Medium</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-softWhite/50">Relevance:</span>
                        <span className="ml-2 text-neonCyan">0.92</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-deepBlue/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">Powerful Features</h2>
            <p className="text-softWhite/70 max-w-2xl mx-auto">
              Our platform combines cutting-edge AI technology with intuitive design to revolutionize question generation and assessment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <FuturisticCard className="h-full" hoverable>
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 p-3 rounded-full bg-deepBlue/70 border border-neonCyan/20">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-softWhite">{feature.title}</h3>
                    <p className="text-softWhite/70">{feature.description}</p>
                  </div>
                </FuturisticCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">How It Works</h2>
            <p className="text-softWhite/70 max-w-2xl mx-auto">
              A simple four-step process to transform your PDFs into effective multiple-choice questions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <FuturisticCard className="h-full" hoverable>
                  <div className="text-center">
                    <div className="inline-block mb-4 text-2xl font-bold gradient-text">{step.number}</div>
                    <h3 className="text-xl font-bold mb-2 text-softWhite">{step.title}</h3>
                    <p className="text-softWhite/70">{step.description}</p>
                  </div>
                </FuturisticCard>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link to="/register">
              <FuturisticButton size="lg">
                Start Generating MCQs <ChevronRight size={18} />
              </FuturisticButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-deepBlue/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">What People Say</h2>
            <p className="text-softWhite/70 max-w-2xl mx-auto">
              Hear from educators and students who've transformed their assessment process with MCQGenius.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <FuturisticCard className="h-full" hoverable>
                  <div className="flex flex-col h-full">
                    <div className="text-4xl text-neonCyan/30 mb-4">"</div>
                    <p className="text-softWhite/90 mb-4 flex-grow">{testimonial.quote}</p>
                    <div className="mt-4">
                      <p className="font-bold text-softWhite">{testimonial.author}</p>
                      <p className="text-sm text-softWhite/70">{testimonial.role}</p>
                    </div>
                  </div>
                </FuturisticCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative rounded-2xl overflow-hidden"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-neonCyan via-neonPink to-neonCyan opacity-30 blur-xl"></div>
            <div className="relative bg-deepBlue/90 rounded-2xl border border-white/10 shadow-xl p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-6">
                Ready to Transform Your Assessment Process?
              </h2>
              <p className="text-softWhite/70 text-lg max-w-3xl mx-auto mb-8">
                Join thousands of educators and students who've revolutionized how they create and take tests. Get started for free today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <FuturisticButton size="lg" className="w-full sm:w-auto">
                    Create Free Account
                  </FuturisticButton>
                </Link>
                <Link to="/login">
                  <FuturisticButton variant="outline" size="lg" className="w-full sm:w-auto">
                    Sign In
                  </FuturisticButton>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neonCyan/10 bg-deepBlue/80 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <span className="text-2xl font-bold gradient-text">MCQGenius</span>
              <p className="text-softWhite/50 mt-2">AI-Powered MCQ Generation</p>
            </div>
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
              <a href="#features" className="text-softWhite/70 hover:text-softWhite transition-colors">Features</a>
              <a href="#how-it-works" className="text-softWhite/70 hover:text-softWhite transition-colors">How It Works</a>
              <a href="#testimonials" className="text-softWhite/70 hover:text-softWhite transition-colors">Testimonials</a>
              <Link to="/login" className="text-softWhite/70 hover:text-softWhite transition-colors">Login</Link>
              <Link to="/register" className="text-softWhite/70 hover:text-softWhite transition-colors">Register</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-neonCyan/10 text-center">
            <p className="text-softWhite/50 text-sm">
              © {new Date().getFullYear()} MCQGenius. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
