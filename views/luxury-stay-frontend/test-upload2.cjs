const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const https = require('https');

async function testUpload() {
  const file = fs.createWriteStream("real_test.jpg");
  https.get("https://via.placeholder.com/150", async function(response) {
    response.pipe(file);
    file.on('finish', async function() {
      file.close();
      
      try {
        const form = new FormData();
        form.append('fullName', 'Real Image Test');
        form.append('email', `realimg${Date.now()}@example.com`);
        form.append('role', 'Admin');
        form.append('image', fs.createReadStream('real_test.jpg'));
        
        console.log('Sending request...');
        const res = await axios.post('https://luxurystay-hms-backend.vercel.app/api/staff', form, {
          headers: form.getHeaders()
        });
        console.log('SUCCESS:', res.data);
        await axios.delete(`https://luxurystay-hms-backend.vercel.app/api/staff/${res.data.staff._id}`);
      } catch (error) {
        console.error('ERROR:', error.response?.data || error.message);
      }
    });
  });
}
testUpload();
