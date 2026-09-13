const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testUpload() {
  try {
    const form = new FormData();
    form.append('fullName', 'Real Image Test');
    form.append('email', `realimg${Date.now()}@example.com`);
    form.append('role', 'Admin');
    form.append('image', fs.createReadStream('test.png'));
    
    console.log('Sending request...');
    const res = await axios.post('https://luxurystay-hms-backend.vercel.app/api/staff', form, {
      headers: form.getHeaders()
    });
    console.log('SUCCESS:', res.data);
    await axios.delete(`https://luxurystay-hms-backend.vercel.app/api/staff/${res.data.staff._id}`);
  } catch (error) {
    console.error('ERROR:', error.response?.data || error.message);
  }
}
testUpload();
