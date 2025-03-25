var express = require("express");
var router = express.Router();
const axios = require("axios");

const validateInput = (fname, lname, company, email) => {
  const errors = [];

  if (!fname || fname.trim().length < 2) {
    errors.push("Name must be at least 2 characters long.");
  }

  if (!lname || lname.trim().length < 2) {
    errors.push("Name must be at least 2 characters long.");
  }

  if (!company || company.trim().length < 3) {
    errors.push("Company Name must be at least 3 characters long.");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push("Invalid email format.");
  }

  return errors;
};

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Server Running" });
});

router.post("/contact-us", async function (req, res, next) {
  const { fname, lname, company, email, message } = req.body;

  const errors = validateInput(fname, lname, company, email);
  if (errors.length > 0) {
    return res.status(400).json({ isSubmitted: false, errors });
  }

  // If validation passes

  // get access token

  try {
    const data = new URLSearchParams();
    data.append("grant_type", "password");
    data.append("client_id", process.env.CLIENT_ID);
    data.append("client_secret", process.env.CLIENT_SECRET);
    data.append("username", process.env.USERNAME);
    data.append("password", process.env.PASSWORD);

    const response = await axios.post(
      "https://login.salesforce.com/services/oauth2/token",
      data,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const access_token = response.data.access_token;

    const response_lead = await axios.post(
      "https://thutechs-dev-ed.my.salesforce.com/services/apexrest/LeadCapture/lead",
      {
        "firstName": fname,
        "lastName": lname,
        "email": email,
        "company": company,
        "message": message
    },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer "+access_token
        },
      }
    );

  } catch (error) {
    res.status(400).json({
      isSubmitted: false,
      message: "Failed to get token",
    });
  }


  res
    .status(200)
    .json({ isSubmitted: true, message: "Form submitted successfully!" });
});

module.exports = router;
