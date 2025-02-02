export const validateSignUpForm = (formData: {
  name: string;
  email: string;
  password: string;
  role: string;
}) => {
  const errors: string[] = [];

  if (!formData.name.trim()) {
    errors.push("Name is required");
  }

  if (!formData.email.trim()) {
    errors.push("Email is required");
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.push("Please enter a valid email address");
  }

  if (!formData.password || formData.password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }

  if (!formData.role) {
    errors.push("Please select a role");
  }

  return errors;
};