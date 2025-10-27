// import ContactUsModel from "../models/ContactUs.js";

// class ContactController {
//   // Handle Contact us form submission
//   static submitContactForm = async (req,res) => {
//     try {
//       const {name, phone, email, message, subject} = req.body;
//       const userId = req.user ? req.user._id : null; // Check if user is logged in

//       // Validate input fields 
//       if(!name || !phone || !email || !message) {
//         return res.status(400).json({ status: "failed", message: "All required fields must be filled." });
//       }

//       // Save response
//       const contact = new ContactUsModel({userId,name, phone, email, message, subject});
//       await contact.save();

//       res.status(200).json({ 
//         user:{contact},
//         status: "success",
//         message: "Your query has been received. We will get back to you shortly."
//       })
//     } catch (error) {
//       console.log(error);
//       res.status(500).json({status: "failed", message: "Unable to send your query, Please try again later"});
//     }
//   }
// }

// export default ContactController; 



// it is woking code 

// import ContactUsModel from "../models/ContactUs.js";

// class ContactController {
//   // Handle Contact Us form submission
//   static submitContactForm = async (req, res) => {
//     try {
//       const { name, phone, email, subject, message } = req.body;

//       // Validate required fields
//       if (!name || !phone || !email || !message || !subject) {
//         return res.status(400).json({
//           status: "failed",
//           message: "All required fields must be filled.",
//         });
//       }

//       // Determine `userId` (for logged-in users)
//       const userId = req.user ? req.user._id : null;

//       // Create a new contact document
//       const contact = new ContactUsModel({
//         userId, // Includes `userId` if logged in; otherwise `null`
//         name,
//         phone,
//         email,
//         subject,
//         message,
//       });

//       // Save the contact data to the database
//       await contact.save();

//       // Send success response
//       res.status(200).json({
//         status: "success",
//         message: "Your query has been received. We will get back to you shortly.",
//         data: {
//           id: contact._id,
//           userId: contact.userId,
//           name: contact.name,
//           phone: contact.phone,
//           email: contact.email,
//           subject: contact.subject,
//           message: contact.message,
//           submittedAt: contact.submittedAt,
//         },
//       });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({
//         status: "failed",
//         message: "Unable to submit your query. Please try again later.",
//       });
//     }
//   };
// }

// export default ContactController;




import ContactUsModel from "../models/ContactUs.js";

class ContactController {
  // Handle Contact Us form submission
  static submitContactForm = async (req, res) => {
    try {
      const { name, phone, email, subject, message } = req.body;

      // Validate required fields
      if (!name || !phone || !email || !message || !subject) {
        return res.status(400).json({
          status: "failed",
          message: "All required fields must be filled.",
        });
      }

      // Determine `userId` (for logged-in users)
      const userId = req.user ? req.user._id : null;

      // Create a new contact document
      const contact = new ContactUsModel({
        userId, // Includes `userId` if logged in; otherwise `null`
        name,
        phone,
        email,
        subject,
        message,
      });

      // Save the contact data to the database
      await contact.save();

      // Send success response
      res.status(200).json({
        status: "success",
        message: "Your query has been received. We will get back to you shortly.",
        data: {
          id: contact._id,
          userId: contact.userId,
          name: contact.name,
          phone: contact.phone,
          email: contact.email,
          subject: contact.subject,
          message: contact.message,
          submittedAt: contact.submittedAt,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: "failed",
        message: "Unable to submit your query. Please try again later.",
      });
    }
  };
}

export default ContactController;



// import ContactUsModel from "../models/ContactUs.js";

// class ContactController {
//   // Handle Contact us form submission
//   static submitContactForm = async (req, res) => {
//     try {
//       const { name, phone, email, message, subject } = req.body;

//       // Validate input fields
//       if (!name || !phone || !email || !message) {
//         return res.status(400).json({ status: "failed", message: "All required fields must be filled." });
//       }

//       // Determine userId (if user is logged in)
//       const userId = req.user ? req.user._id : null;

//       // Save response
//       const contact = new ContactUsModel({
//         userId,
//         name,
//         phone,
//         email,
//         message,
//         subject,
//       });
//       await contact.save();

//       res.status(200).json({
//         status: "success",
//         message: "Your query has been received. We will get back to you shortly.",
//         data: contact, // Return saved contact for reference
//       });
//     } catch (error) {
//       console.log(error);
//       res.status(500).json({ status: "failed", message: "Unable to send your query. Please try again later." });
//     }
//   };
// }

// export default ContactController;
