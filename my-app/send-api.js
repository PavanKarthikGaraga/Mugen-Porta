const token = process.argv[2] ? process.argv[2].trim() : '';

if (!token) {
  console.error("Please provide the ZeptoMail Send Mail token as an argument.");
  process.exit(1);
}

const url = "https://api.zeptomail.in/v1.1/email";

const payload = {
  from: {
    address: "noreply@zeroonedevs.in"
  },
  to: [
    {
      email_address: {
        address: "singananischal@gmail.com"
      }
    }
  ],
  subject: "TEST EMAIL OF SAMAM",
  textbody: "This is a test email for SAMAM."
};

fetch(url, {
  method: "POST",
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": "Zoho-enczapikey " + token
  },
  body: JSON.stringify(payload)
})
  .then(res => res.json())
  .then(data => {
    console.log("Response from ZeptoMail API:");
    console.log(JSON.stringify(data, null, 2));
  })
  .catch(err => {
    console.error("Error sending email via API:", err);
  });
