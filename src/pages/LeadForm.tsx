import { useState } from 'react';
import type { Lead } from '../types';
import Chatbot from '../components/Chatbot';
import './LeadForm.css';

const LeadForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    practiceName: '',
    practiceSize: '',
    currentChallenges: '',
    budget: '',
    timeline: '',
    notes: ''
  });

  const [showChatbot, setShowChatbot] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const lead: Lead = {
      id: Date.now().toString(),
      ...formData,
      status: 'new',
      createdAt: new Date().toISOString()
    };

    // Store in localStorage (in production, this would be an API call)
    const existingLeads = JSON.parse(localStorage.getItem('leads') || '[]');
    localStorage.setItem('leads', JSON.stringify([...existingLeads, lead]));

    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        phone: '',
        practiceName: '',
        practiceSize: '',
        currentChallenges: '',
        budget: '',
        timeline: '',
        notes: ''
      });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="lead-form-container">
      <div className="lead-form-header">
        <div className="header-content">
          <h1>Premium Dental Practice Solutions</h1>
          <p className="subtitle">Transform your practice with our elite lead management system</p>
        </div>
      </div>

      <div className="lead-form-content">
        <div className="form-wrapper">
          {submitted ? (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h2>Thank You!</h2>
              <p>Your application has been received. Our team will contact you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="lead-form">
              <h2>Apply for Premium Access</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Dr. John Smith"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@dentalpractice.com"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="practiceName">Practice Name *</label>
                  <input
                    type="text"
                    id="practiceName"
                    name="practiceName"
                    value={formData.practiceName}
                    onChange={handleChange}
                    required
                    placeholder="Elite Dental Care"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="practiceSize">Practice Size *</label>
                  <select
                    id="practiceSize"
                    name="practiceSize"
                    value={formData.practiceSize}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select size...</option>
                    <option value="solo">Solo Practice (1 dentist)</option>
                    <option value="small">Small (2-4 dentists)</option>
                    <option value="medium">Medium (5-9 dentists)</option>
                    <option value="large">Large (10+ dentists)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="timeline">Desired Timeline *</label>
                  <select
                    id="timeline"
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select timeline...</option>
                    <option value="immediate">Immediate (within 1 month)</option>
                    <option value="short">Short-term (1-3 months)</option>
                    <option value="medium">Medium-term (3-6 months)</option>
                    <option value="long">Long-term (6+ months)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="budget">Monthly Budget Range *</label>
                <select
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select budget range...</option>
                  <option value="starter">Starter ($500 - $1,000/mo)</option>
                  <option value="professional">Professional ($1,000 - $2,500/mo)</option>
                  <option value="premium">Premium ($2,500 - $5,000/mo)</option>
                  <option value="enterprise">Enterprise ($5,000+/mo)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="currentChallenges">Current Challenges *</label>
                <textarea
                  id="currentChallenges"
                  name="currentChallenges"
                  value={formData.currentChallenges}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="What are your main challenges with lead management?"
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">Additional Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Any additional information you'd like to share..."
                />
              </div>

              <button type="submit" className="submit-button">
                Submit Application
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Chatbot Toggle Button */}
      <button 
        className="chatbot-toggle"
        onClick={() => setShowChatbot(!showChatbot)}
        aria-label="Toggle chatbot"
      >
        {showChatbot ? '✕' : '💬'}
      </button>

      {/* Chatbot Component */}
      {showChatbot && <Chatbot onClose={() => setShowChatbot(false)} />}
    </div>
  );
};

export default LeadForm;
