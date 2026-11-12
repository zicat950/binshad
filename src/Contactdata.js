// Central configuration for the Contact page.
// Add your real profile URLs below. Links with an empty `url` stay inactive
// (nothing is invented) until you fill them in.

export const contactData = {
  whatsapp: {
    number: "919037970700", // digits only, used by wa.me
    display: "+91 90379 70700",
    defaultMessage:
      "Hello! I visited your portfolio and would like to connect with you.",
  },

  location: {
    availability: "AVAILABLE WORLDWIDE",
    place: "KOCHI, KERALA, INDIA.",
  },

  year: 2026,

  socials: [
    { id: "instagram", label: "INSTAGRAM", tagline: "Follow my journey.", cta: "CONNECT", url: "https://www.instagram.com/binshad_bk?dlrf=MWEydmtyMmI2NDBtYw==" }, // <-- add URL
    { id: "facebook", label: "FACEBOOK", tagline: "Stay connected.", cta: "CONNECT", url: "" }, // <-- add URL
    { id: "linkedin", label: "LINKEDIN", tagline: "Professional networking.", cta: "CONNECT", url: "https://www.linkedin.com/in/binshad-k-a40530250?utm_source=share_via&utm_content=profile&utm_medium=member_ios" }, // <-- add URL
  ],
};

export const buildWhatsAppUrl = (message = contactData.whatsapp.defaultMessage) =>
  `https://wa.me/${contactData.whatsapp.number}?text=${encodeURIComponent(message)}`;