import mongoose from "mongoose";

const contactUsSchema = new mongoose.Schema({
  userId: {type: mongoose.Types.ObjectId, ref: 'User', default: null},
  name: {type: String, required: true}, // for unregistered users
  phone: {type: Number, required: true,},// for unregistered users
  email: { type: String, required: true }, // For unregistered users
  subject: { type: String, required: true },
  message: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
});

// Model
const ContactUsModel = mongoose.model("contact_us", contactUsSchema);

export default ContactUsModel;

