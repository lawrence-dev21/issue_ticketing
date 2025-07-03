
import React, { useState, FormEvent } from 'react';
import { useData } from '../hooks/useData';
import { MOCK_DEPARTMENTS, APP_TITLE } from '../constants';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Textarea from '../components/common/Textarea';
import { Ticket } from '../types'; // Import Ticket type
import { Link } from 'react-router-dom';


const HomePage: React.FC = () => {
  const { addTicket } = useData();
  const [requesterName, setRequesterName] = useState('');
  const [requesterEmail, setRequesterEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState(MOCK_DEPARTMENTS[0]?.id || '');
  const [issueDescription, setIssueDescription] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!requesterName || !requesterEmail || !phone || !department || !issueDescription) {
      setError('All fields except attachment are required.');
      return;
    }

    const ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'dueDate'> = {
      requesterName,
      requesterEmail,
      phone,
      department: MOCK_DEPARTMENTS.find(d => d.id === department)?.name || department,
      issueDescription,
      attachmentName: attachment?.name,
    };
    addTicket(ticketData);
    setIsSubmitted(true);
    // Reset form
    setRequesterName('');
    setRequesterEmail('');
    setPhone('');
    setDepartment(MOCK_DEPARTMENTS[0]?.id || '');
    setIssueDescription('');
    setAttachment(null);
    const fileInput = document.getElementById('attachment') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-ministry-blue to-ministry-green p-6">
        <div className="bg-white p-8 md:p-12 rounded-xl shadow-2xl text-center max-w-md w-full">
          <svg className="w-20 h-20 text-ministry-green mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Ticket Submitted!</h2>
          <p className="text-gray-600 mb-8">
            Thank you for submitting your ICT issue. Our team will review it shortly. You will receive updates via the email you provided.
          </p>
          <Button onClick={() => setIsSubmitted(false)} variant="primary" size="lg">
            Submit Another Issue
          </Button>
           <Link to="/login" className="block mt-4 text-ministry-blue hover:underline">
            Staff Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 via-gray-50 to-blue-100 p-4 sm:p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
            <img src="../assets/logo.png" alt="Ministry Logo" className="mx-auto mb-2 h-20 object-cover"/>
            <h1 className="text-3xl sm:text-4xl font-bold text-ministry-blue">{APP_TITLE}</h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Log your issues here. Please provide as much detail as possible.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl space-y-6">
          {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md text-sm" role="alert">{error}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Full Name" id="requesterName" type="text" value={requesterName} onChange={(e) => setRequesterName(e.target.value)} required placeholder="e.g., John Doe"/>
            <Input label="Email Address" id="requesterEmail" type="email" value={requesterEmail} onChange={(e) => setRequesterEmail(e.target.value)} required placeholder="e.g., john.doe@example.com"/>
            <Input label="Phone Number" id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="e.g, +260 979 123 456" />
          </div>
          
          <Select label="Department" id="department" value={department} onChange={(e) => setDepartment(e.target.value)} required>
            {MOCK_DEPARTMENTS.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </Select>
          
          <Textarea label="Issue Description" id="issueDescription" value={issueDescription} onChange={(e) => setIssueDescription(e.target.value)} required placeholder="Describe the problem you are facing in detail..."/>
          
          <div>
            <label htmlFor="attachment" className="block text-sm font-medium text-gray-700 mb-1">Attach Document (Optional)</label>
            <input 
              type="file" 
              id="attachment" 
              onChange={(e) => setAttachment(e.target.files ? e.target.files[0] : null)} 
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-ministry-blue file:text-white hover:file:bg-blue-700 transition-colors"
            />
            {attachment && <p className="text-xs text-gray-500 mt-1">Selected: {attachment.name}</p>}
          </div>
          
          <div className="pt-2">
            <Button type="submit" variant="primary" size="lg" className="w-full">
              Submit Ticket
            </Button>
          </div>
          <div className="text-center mt-4">
             <Link to="/login" className="text-sm text-ministry-blue hover:underline">
                Are you an ICT Staff member? Login here.
            </Link>
          </div>
        </form>
      </div>
       <footer className="mt-12 text-center text-gray-500 text-xs">
        &copy; {new Date().getFullYear()} Ministry of Agriculture. All rights reserved.
      </footer>
    </div>
  );
};

export default HomePage;
