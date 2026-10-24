export const ContactUs = (req, res) => {
  const { fullName, email, phone, message } = req.body || {};

  if (!fullName || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "Full name, email, and message are required.",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Thank you for contacting us. Our team will reply soon.",
    contact: {
      fullName,
      email,
      phone: phone || "",
      message,
    },
  });
};
