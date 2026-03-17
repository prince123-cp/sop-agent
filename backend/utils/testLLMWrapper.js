const { callLLM } = require('./llmWrapper');

// Test function
const testLLMWrapper = async () => {
  console.log('Testing LLM Wrapper...');

  // Test 1: Question in context
  const context1 = `[Source: Refund_SOP.pdf | Page: 12]
Refund process: Submit request, get manager approval, payment within 5 days.`;

  const question1 = 'What is the refund process?';
  const answer1 = await callLLM(context1, question1);
  console.log('Test 1 - Answer:', answer1);

  // Test 2: Question not in context
  const context2 = `[Source: Refund_SOP.pdf | Page: 12]
Refund process: Submit request, get manager approval, payment within 5 days.`;

  const question2 = 'What is the hiring process?';
  const answer2 = await callLLM(context2, question2);
  console.log('Test 2 - Answer:', answer2);

  // Test 3: Ambiguous question
  const context3 = `[Source: Refund_SOP.pdf | Page: 12]
Refund process: Submit request.`;

  const question3 = 'How long does refund take?';
  const answer3 = await callLLM(context3, question3);
  console.log('Test 3 - Answer:', answer3);
};

// Run test if called directly
if (require.main === module) {
  testLLMWrapper();
}

module.exports = { testLLMWrapper };
