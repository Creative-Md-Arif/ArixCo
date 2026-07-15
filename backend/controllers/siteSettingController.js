import SiteSetting from "../models/siteSettingModel.js";
import pkg from "cloudinary";
const { v2: cloudinary } = pkg;

export const getSiteSettings = async (req, res) => {
  try {
    // singleton: প্রথমটা যদি পাওয়া যায় তাহলে সেটাই, না পাওয়া গেলে default দিয়ে নতুন create
    let settings = await SiteSetting.findOne();

    if (!settings) {
      settings = await SiteSetting.create({});
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch site settings",
      error: error.message,
    });
  }
};

export const updateSiteSettings = async (req, res) => {
  try {
    const { contact, socialLinks, copyrightText, logo } = req.body;

    let settings = await SiteSetting.findOne();

    if (!settings) {
      settings = new SiteSetting({});
    }

    if (
      logo &&
      logo.public_id &&
      settings.logo?.public_id &&
      settings.logo.public_id !== logo.public_id
    ) {
      try {
        await cloudinary.uploader.destroy(settings.logo.public_id);
      } catch (err) {
        console.error(
          "Failed to delete old logo from cloudinary:",
          err.message,
        );
      }
    }

    if (logo) {
      settings.logo = { url: logo.url || "", public_id: logo.public_id || "" };
    }

    if (contact) {
      settings.contact = { ...settings.contact.toObject(), ...contact };
    }

    if (socialLinks) {
      settings.socialLinks = {
        ...settings.socialLinks.toObject(),
        ...socialLinks,
      };
    }

    if (copyrightText !== undefined) {
      settings.copyrightText = copyrightText;
    }

    await settings.save();

    res.status(200).json({
      success: true,
      message: "Site settings updated successfully",
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update site settings",
      error: error.message,
    });
  }
};
