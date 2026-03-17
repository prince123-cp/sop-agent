import axios from 'axios';

const BASE_URL = 'http://localhost:5000'; // Assuming server runs on port 5000

const testChatAPI = async () => {
  const testCases = [
    {
      question: 'Refund ka process kya hai?',
      description: 'Question present in SOP (should return answer with sources)'
    },
    {
      question: 'How do I process a refund?',
      description: 'English version of same question'
    },
    {
      question: 'What is the weather today?',
      description: 'Question NOT in SOP (should return "Information not available in SOP")'
    },
    {
      question: 'Hi',
      description: 'Too short question (should return validation error)'
    }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`\n=== Testing: ${testCase.description} ===`);
      console.log(`Question: "${testCase.question}"`);

      const response = await axios.post(`${BASE_URL}/api/chat/ask`, {
        question: testCase.question
      });

      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(response.data, null, 2));

    } catch (error) {
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Error Response:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.log('Error:', error.message);
      }
    }
  }
};

// Run the test
testChatAPI().then(() => {
  console.log('\n=== Chat API Testing Complete ===');
}).catch(console.error);
