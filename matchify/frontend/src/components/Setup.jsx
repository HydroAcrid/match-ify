import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { updateEmail, updatePassword } from 'firebase/auth';

const Setup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSetup = async (e) => {
    e.preventDefault();

    try {
      const user = auth.currentUser;

      // Update the user's email
      await updateEmail(user, email);

      // Set the user's password
      await updatePassword(user, password);

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  return (
    <div>
      <h1>Set Up Your Account</h1>
      <form onSubmit={handleSetup}>
        {/* Form fields */}
      </form>
    </div>
  );
};

export default Setup;
