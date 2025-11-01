import { Phone, Mail, Facebook, Instagram, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FloatingSocialButtons() {
  const socialLinks = {
    whatsapp: "https://wa.me/919876543210",
    email: "mailto:hello@prakrithi.com",
    facebook: "https://facebook.com/prakrithi",
    instagram: "https://instagram.com/prakrithi",
    youtube: "https://youtube.com/@prakrithi",
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
      {/* WhatsApp Button */}
      <Button
        size="icon"
        className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg hover:scale-110 transition-transform"
        asChild
      >
        <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Contact on WhatsApp">
          <Phone className="h-6 w-6" />
        </a>
      </Button>

      {/* Email Button */}
      <Button
        size="icon"
        className="h-14 w-14 rounded-full bg-orange-500 hover:bg-orange-600 shadow-lg hover:scale-110 transition-transform"
        asChild
      >
        <a href={socialLinks.email} aria-label="Send Email">
          <Mail className="h-6 w-6" />
        </a>
      </Button>

      {/* Facebook Button */}
      <Button
        size="icon"
        className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg hover:scale-110 transition-transform"
        asChild
      >
        <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Follow on Facebook">
          <Facebook className="h-5 w-5" />
        </a>
      </Button>

      {/* Instagram Button */}
      <Button
        size="icon"
        className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 hover:opacity-90 shadow-lg hover:scale-110 transition-all"
        asChild
      >
        <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Follow on Instagram">
          <Instagram className="h-5 w-5" />
        </a>
      </Button>

      {/* YouTube Button */}
      <Button
        size="icon"
        className="h-12 w-12 rounded-full bg-red-600 hover:bg-red-700 shadow-lg hover:scale-110 transition-transform"
        asChild
      >
        <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" aria-label="Subscribe on YouTube">
          <Youtube className="h-5 w-5" />
        </a>
      </Button>
    </div>
  );
}
