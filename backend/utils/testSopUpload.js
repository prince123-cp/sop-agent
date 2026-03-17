import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:5001/api/sop';

const testSopUpload = async () => {
  console.log('=== SOP Upload Testing ===\n');

  // Test 1.1: Valid PDF Upload Test
  console.log('TODO 1.1 – PDF Upload Test');
  try {
    const formData = new FormData();
    formData.append('pdf', fs.createReadStream(path.join(__dirname, '../uploads/sops/test_sop.pdf')));
    formData.append('name', 'Test SOP');
    formData.append('department', 'IT');
    formData.append('version', '1.0');

    const response = await axios.post(`${BASE_URL}/upload`, formData, {
      headers: formData.getHeaders(),
    });

    console.log('Status:', response.status);
    console.log('Response:', response.data);
    console.log('✅ Valid PDF upload successful\n');
  } catch (error) {
    console.log('❌ Valid PDF upload failed:', error.response?.data || error.message);
  }

  // Test 1.2: Invalid File Test - .txt
  console.log('TODO 1.2 – Invalid File Test (.txt)');
  try {
    const formData = new FormData();
    formData.append('pdf', Buffer.from('This is a text file'), { filename: 'test.txt' });
    formData.append('name', 'Test SOP');
    formData.append('department', 'IT');
    formData.append('version', '1.0');

    const response = await axios.post(`${BASE_URL}/upload`, formData, {
      headers: formData.getHeaders(),
    });

    console.log('Status:', response.status);
    console.log('Response:', response.data);
    console.log('❌ Should have rejected .txt file\n');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('Status:', error.response.status);
      console.log('Response:', error.response.data);
      console.log('✅ Correctly rejected .txt file\n');
    } else {
      console.log('❌ Unexpected error:', error.response?.data || error.message);
    }
  }

  // Test 1.3: Missing Fields Test
  console.log('TODO 1.3 – Missing Fields Test');
  try {
    const formData = new FormData();
    formData.append('pdf', fs.createReadStream(path.join(__dirname, '../uploads/sops/test_sop.pdf')));
    // Missing name, department, version

    const response = await axios.post(`${BASE_URL}/upload`, formData, {
      headers: formData.getHeaders(),
    });

    console.log('Status:', response.status);
    console.log('Response:', response.data);
    console.log('❌ Should have rejected missing fields\n');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('Status:', error.response.status);
      console.log('Response:', error.response.data);
      console.log('✅ Correctly rejected missing fields\n');
    } else {
      console.log('❌ Unexpected error:', error.response?.data || error.message);
    }
  }

  console.log('=== SOP Upload Testing Complete ===');
};

// Run test if this file is executed directly
testSopUpload().catch(console.error);
