import { useState } from 'react';
import { sendMessage } from '../api/chatgpt';
import 'tailwindcss/tailwind.css';

const Home = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const gptResponse = await sendMessage(message);
      setResponse(gptResponse);
    } catch (error) {
      console.error('Error:', error);
      setResponse('Error fetching response from ChatGPT API');
    }
  };

  return (
    <div className="container mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-5">ChatGPT API Integration</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="message" className="block text-sm font-medium">
            Your Message:
          </label>
          <input
            id="message"
            name="message"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-1 border border-gray-300 p-2 rounded w-full"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Send Message
        </button>
      </form>
      {response && (
        <div className="mt-5">
          <h2 className="text-xl font-semibold">ChatGPT Response:</h2>
          <p className="bg-gray-100 p-4 rounded">{response}</p>
        </div>
      )}
    </div>
  );
};

export default Home;
