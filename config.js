/**
 * SuamiSihat Email Signature — Company Configuration
 * =====================================================
 * Edit this file to update any company-wide details.
 * All changes here will automatically reflect in the signature generator.
 */

const CONFIG = {
  company: {
    name: "SuamiSihat (M) Sdn Bhd",
    hqPhone: "+60356260031",
    hqPhoneDisplay: "+603 5626 0031",
    hqPhoneLabel: "HQ",
    website: "https://suamisihat.com.my",
    websiteDisplay: "suamisihat.com.my",
    address: "No. 9, Tingkat 2, Jalan Kemboja 33, Taman Aman, 42700 Banting, Selangor Darul Ehsan, MALAYSIA",
    googleMapsUrl:
      "https://maps.google.com/?q=No.+9,+Tingkat+2,+Jalan+Kemboja+33,+Taman+Aman,+42700+Banting,+Selangor+Darul+Ehsan,+MALAYSIA",
    logoUrl:
      "https://raw.githubusercontent.com/SuamiSihat/mail-signature/main/assets/ss-logo.png",
  },

  social: {
    linkedin: {
      url: "https://my.linkedin.com/company/suamisihat",
      icon: "https://raw.githubusercontent.com/SuamiSihat/mail-signature/main/assets/ld.png",
      label: "LinkedIn",
    },
    facebook: {
      url: "https://facebook.com/suamisihat.com.my",
      icon: "https://raw.githubusercontent.com/SuamiSihat/mail-signature/main/assets/fb.png",
      label: "Facebook",
    },
    tiktok: {
      url: "https://www.tiktok.com/@suamisihatofficial",
      icon: "https://raw.githubusercontent.com/SuamiSihat/mail-signature/main/assets/tt.png",
      label: "TikTok",
    },
    instagram: {
      url: "https://www.instagram.com/suamisihat.com.my/",
      icon: "https://raw.githubusercontent.com/SuamiSihat/mail-signature/main/assets/ig.png",
      label: "Instagram",
    },
    twitter: {
      url: "https://x.com/suamisihat",
      icon: "https://raw.githubusercontent.com/SuamiSihat/mail-signature/main/assets/x.png",
      label: "X (Twitter)",
    },
    youtube: {
      url: "https://www.youtube.com/c/SuamiSihat",
      icon: "https://raw.githubusercontent.com/SuamiSihat/mail-signature/main/assets/yt.png",
      label: "YouTube",
    },
    telegram: {
      url: "https://t.me/suamisihat",
      icon: "https://raw.githubusercontent.com/SuamiSihat/mail-signature/main/assets/tele.png",
      label: "Telegram",
    },
  },

  apps: {
    bannerImage:
      "https://raw.githubusercontent.com/SuamiSihat/mail-signature/main/assets/jointhemovement.png",
    bannerAlt: "Join The Movement Banner",
    bannerLink: "https://t.me/suamisihat",
    downloadLabel: "Download our app now!",
    playStore: {
      url: "https://play.google.com/store/apps/details?id=com.suamisihat.user&pcampaignid=web_share",
      icon: "https://raw.githubusercontent.com/SuamiSihat/mail-signature/main/assets/playstore.png",
      alt: "Google Play Store",
    },
    appStore: {
      url: "https://apps.apple.com/my/app/suamisihat/id6670251626",
      icon: "https://raw.githubusercontent.com/SuamiSihat/mail-signature/main/assets/appstore.png",
      alt: "Apple App Store",
    },
  },

  footer: {
    disclaimer:
      "IMPORTANT: The contents of this email and any attachments are confidential. They are intended for the named recipient(s) only. If you have received this email by mistake, please notify the sender immediately and do not disclose the contents to anyone or make copies thereof.",
  },
};

// Export for use in generator.js
if (typeof module !== "undefined") module.exports = CONFIG;
