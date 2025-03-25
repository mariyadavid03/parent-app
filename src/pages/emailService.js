import { EmailsApi } from "@elasticemail/elasticemail-client";
import axios from 'axios';

const sendVerificationEmail = async (email, otp) => {
  const apiKey = "8D83652D494557C1C512B81BFEE3FB4A19C61125765ADF683712426A17A03F1237CBBF6B700BD2B8280028EBFE25DD26"; // Replace with a valid API key
  const fromEmail = "mariyadavidkandy@gmail.com"; 

  const emailData = {
    Recipients: [{ Email: email }],  
    Content: {
      From: fromEmail,  
      Subject: "Email Verification - ChildSafe",  
      Body: [
        {
          ContentType: "HTML",  
          Content: `<h2>Your Verification Code</h2>
                    <p>Your OTP code is: <strong>${otp}</strong></p>
                    <p>Enter this code to verify your email.</p>`,  
        },
      ],
    },
    Options: {
      TrackOpens: "true",  
      TrackClicks: "true",  
    },
  };

  const headers = {
    'X-ElasticEmail-ApiKey': apiKey,  
    'Content-Type': 'application/json',  
  };

  try {
    const response = await axios.post('https://api.elasticemail.com/v4/emails', emailData, { headers });
    console.log("Email sent:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending email:", error.response ? error.response.data : error);
    throw error;  
  }
};

export default sendVerificationEmail;