import * as Yup from 'yup';

// Login validation schema
export const loginSchema = Yup.object({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

// Registration validation schema
export const registrationSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  password_confirmation: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Password confirmation is required'),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .required('Phone number is required'),
});

// Register schema (alias for registration)
export const registerSchema = registrationSchema;

// OTP validation schema
export const otpSchema = Yup.object({
  otp: Yup.string()
    .length(6, 'OTP must be exactly 6 digits')
    .matches(/^[0-9]{6}$/, 'OTP must contain only numbers')
    .required('OTP is required'),
});

// Password reset validation schema
export const passwordResetSchema = Yup.object({
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  password_confirmation: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Password confirmation is required'),
});

// Reset password link validation schema
export const resetPasswordLinkSchema = Yup.object({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
});

// Reset password schema (for password reset confirmation)
export const resetPasswordSchema = Yup.object({
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  password_confirmation: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Password confirmation is required'),
});

// Verify email validation schema
export const verifyEmailSchema = Yup.object({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
});

// Contact us validation schema
export const contactUsSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  subject: Yup.string()
    .min(5, 'Subject must be at least 5 characters')
    .required('Subject is required'),
  message: Yup.string()
    .min(10, 'Message must be at least 10 characters')
    .required('Message is required'),
});

// Change password validation schema
export const changePasswordSchema = Yup.object({
  currentPassword: Yup.string()
    .required('Current password is required'),
  newPassword: Yup.string()
    .min(6, 'New password must be at least 6 characters')
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    .required('Password confirmation is required'),
});

// Contact form validation schema (alias for contactUsSchema)
export const contactSchema = contactUsSchema;

// Property registration validation schema
export const propertyRegistrationSchema = Yup.object({
  seller_name: Yup.string().required('Seller name is required'),
  seller_father_name: Yup.string().required('Seller father name is required'),
  seller_address: Yup.string().required('Seller address is required'),
  seller_aadhaar: Yup.string()
    .matches(/^[0-9]{12}$/, 'Aadhaar number must be 12 digits')
    .required('Seller Aadhaar is required'),
  seller_mobile: Yup.string()
    .matches(/^[0-9]{10}$/, 'Mobile number must be 10 digits')
    .required('Seller mobile is required'),
  buyer_name: Yup.string().required('Buyer name is required'),
  buyer_father_name: Yup.string().required('Buyer father name is required'),
  buyer_address: Yup.string().required('Buyer address is required'),
  buyer_aadhaar: Yup.string()
    .matches(/^[0-9]{12}$/, 'Aadhaar number must be 12 digits')
    .required('Buyer Aadhaar is required'),
  buyer_mobile: Yup.string()
    .matches(/^[0-9]{10}$/, 'Mobile number must be 10 digits')
    .required('Buyer mobile is required'),
  property_address: Yup.string().required('Property address is required'),
  property_type: Yup.string().required('Property type is required'),
  sale_price: Yup.number()
    .positive('Sale price must be positive')
    .required('Sale price is required'),
  registration_date: Yup.date()
    .max(new Date(), 'Registration date cannot be in the future')
    .required('Registration date is required'),
});

// Sale deed validation schema
export const saleDeedSchema = Yup.object({
  // Add sale deed specific validation rules here
  seller_name: Yup.string().required('Seller name is required'),
  buyer_name: Yup.string().required('Buyer name is required'),
  property_address: Yup.string().required('Property address is required'),
  sale_price: Yup.number()
    .positive('Sale price must be positive')
    .required('Sale price is required'),
});

// Will deed validation schema
export const willDeedSchema = Yup.object({
  testator_name: Yup.string().required('Testator name is required'),
  testator_address: Yup.string().required('Testator address is required'),
  executor_name: Yup.string().required('Executor name is required'),
  executor_address: Yup.string().required('Executor address is required'),
  witness1_name: Yup.string().required('Witness 1 name is required'),
  witness2_name: Yup.string().required('Witness 2 name is required'),
});

// Power of attorney validation schema
export const powerOfAttorneySchema = Yup.object({
  principal_name: Yup.string().required('Principal name is required'),
  agent_name: Yup.string().required('Agent name is required'),
  property_details: Yup.string().required('Property details are required'),
  powers_granted: Yup.array()
    .min(1, 'At least one power must be granted')
    .required('Powers are required'),
});

// Trust deed validation schema
export const trustDeedSchema = Yup.object({
  trust_name: Yup.string().required('Trust name is required'),
  trust_address: Yup.string().required('Trust address is required'),
  settlor_name: Yup.string().required('Settlor name is required'),
  trustee_name: Yup.string().required('Trustee name is required'),
  trust_property: Yup.string().required('Trust property details are required'),
});

// Adoption deed validation schema
export const adoptionDeedSchema = Yup.object({
  adoptive_parent_name: Yup.string().required('Adoptive parent name is required'),
  adopted_child_name: Yup.string().required('Adopted child name is required'),
  biological_parent_name: Yup.string().required('Biological parent name is required'),
  adoption_date: Yup.date()
    .max(new Date(), 'Adoption date cannot be in the future')
    .required('Adoption date is required'),
});

// Property sale certificate validation schema
export const propertySaleCertificateSchema = Yup.object({
  bank_name: Yup.string().required('Bank name is required'),
  bank_pan: Yup.string()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'PAN number must be in correct format')
    .required('Bank PAN is required'),
  bank_rep_name: Yup.string().required('Bank representative name is required'),
  bank_rep_email: Yup.string()
    .email('Please enter a valid email address')
    .required('Bank representative email is required'),
  property_address: Yup.string().required('Property address is required'),
  property_type: Yup.string().required('Property type is required'),
  property_area: Yup.number()
    .positive('Property area must be positive')
    .required('Property area is required'),
  property_value: Yup.number()
    .positive('Property value must be positive')
    .required('Property value is required'),
});

export default {
  loginSchema,
  registrationSchema,
  registerSchema,
  otpSchema,
  passwordResetSchema,
  resetPasswordLinkSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  changePasswordSchema,
  contactSchema,
  contactUsSchema,
  propertyRegistrationSchema,
  saleDeedSchema,
  willDeedSchema,
  powerOfAttorneySchema,
  trustDeedSchema,
  adoptionDeedSchema,
  propertySaleCertificateSchema,
};
