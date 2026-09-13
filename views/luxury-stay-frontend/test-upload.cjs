const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testUpload() {
  try {
    fs.writeFileSync('test.jpg', 'fake image data');
    const form = new FormData();
    form.append('fullName', 'Image Test');
    form.append('email', `imgtest${Date.now()}@example.com`);
    form.append('role', 'Admin');
    form.append('image', fs.createReadStream('test.jpg'));
    
    console.log('Sending request...');
    const res = await axios.post('https://luxurystay-hms-backend.vercel.app/api/staff', form, {
      headers: form.getHeaders()
    });
    console.log('SUCCESS:', res.data);
    
    // cleanup
    await axios.delete(`https://luxurystay-hms-backend.vercel.app/api/staff/${res.data.staff._id}`);
  } catch (error) {
    console.error('ERROR:', error.response?.data || error.message);
  }
}
testUpload();
