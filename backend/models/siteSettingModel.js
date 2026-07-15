import mongoose from "mongoose";

const siteSettingSchema = new mongoose.Schema(
  {
    logo: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" },
    },
    contact: {
      email: { type: String, default: "support@arixgear.com" },
      phone: { type: String, default: "+880 17100000000" },
      address: { type: String, default: "Dhaka, Bangladesh" },
    },
    socialLinks: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      youtube: { type: String, default: "" },
      twitter: { type: String, default: "" },
      linkedin: { type: String, default: "" },
    },
    copyrightText: {
      type: String,
      default: "ARIX CO — All rights reserved.",
    },
  },
  { timestamps: true },
);

// Singleton pattern: শুধু একটা document থাকবে
const SiteSetting = mongoose.model("SiteSetting", siteSettingSchema);

export default SiteSetting;
