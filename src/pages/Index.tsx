import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Calendar, Clock } from "lucide-react";
import EventCard from "@/components/EventCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Photo {
  id: number;
  src: string;
  alt: string;
  caption: string;
}

interface Tribute {
  id: number;
  name: string;
  relationship: string;
  message: string;
  timestamp: string;
  type: string;
}

const withFullSrc = <T extends { src: string }>(p: T): T => ({
  ...p,
  src: p.src.startsWith("http")
    ? p.src
    : `${API_BASE_URL}${p.src.startsWith("/") ? "" : "/"}${p.src}`,
});

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [previewImages, setPreviewImages] = useState<Photo[]>([]);
  const [recentTributes, setRecentTributes] = useState<Tribute[]>([]);
  

  useEffect(() => {
    fetch(`${API_BASE_URL}/photos`)
      .then((response) => response.json())
      .then((data) => {
        setPreviewImages(data.slice(0, 6).map(withFullSrc));
      })
      .catch((error) => console.error("Error fetching photos:", error));

    fetch(`${API_BASE_URL}/tributes`)
      .then((response) => response.json())
      .then((data) => {
        setRecentTributes(data.slice(0, 3));
      })
      .catch((error) => console.error("Error fetching tributes:", error));
  }, []);

  

  const truncateHTML = (html: string, maxLength: number) => {
    const strippedString = html.replace(/<[^>]+>/g, "");
    if (strippedString.length <= maxLength) return strippedString;
    return strippedString.substring(0, maxLength) + "...";
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Background with the uploaded image */}
      <div className="fixed inset-0 scroll-bg opacity-40 z-0"></div>

      <Navigation />

      <div className="relative z-10">
        {/* Hero Section - Main Image Display */}
        <section className="relative isolate overflow-hidden">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/80"></div>

          {/* Content wrapper — extra top-padding on md+ so it clears the fixed navbar */}
          <div className="relative z-20 mx-auto max-w-6xl px-4 flex flex-col items-center justify-center pt-12 pb-12 md:pt-36 md:pb-24 lg:pt-40">
            {/* Years & portrait */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 lg:gap-16 mb-8">
              {/* Birth Year */}
              <div
                className="text-center md:text-right animate-fade-in order-1"
                style={{ animationDelay: "0.2s" }}
              >
                <div
                className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-bold text-gold subtle-glow"
                style={{ fontFamily: '"Cinzel Decorative", cursive' }}
              >
                1960
              </div>
                <div className="text-xs sm:text-sm md:text-lg lg:text-xl text-gray-300 uppercase tracking-wider">
                  Born
                </div>
              </div>

              {/* Portrait */}
              <div
                className="relative animate-scale-in order-2"
                style={{ animationDelay: "0.4s" }}
              >
                <div className="w-56 h-56 sm:w-64 sm:h-64 md:w-48 md:h-48 lg:w-64 lg:h-64 rounded-full overflow-hidden border-4 border-gold shadow-2xl shadow-gold/30">
                  <img
                    src="/lovable-uploads/9b3d3675-5129-47d9-8118-83f63cff5e3e.png"
                    alt="Bernard Muasya Kasema"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -top-2 -right-2 md:-top-4 md:-right-4 w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-gold to-yellow-600 rounded-full flex items-center justify-center border border-gold/40 shadow-lg animate-pulse">
                  <div className="text-black text-sm md:text-xl">🕊️</div>
                </div>
              </div>

              {/* Death Year */}
              <div
                className="text-center md:text-left animate-fade-in order-3"
                style={{ animationDelay: "0.6s" }}
              >
                <div
                className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-bold text-gold subtle-glow"
                style={{ fontFamily: '"Cinzel Decorative", cursive' }}
              >
                2025
              </div>
                <div className="text-xs sm:text-sm md:text-lg lg:text-xl text-gray-300 uppercase tracking-wider">
                  Rest
                </div>
              </div>
            </div>

            {/* Name & title */}
            <div
              className="animate-fade-in-up text-center"
              style={{ animationDelay: "0.8s" }}
            >
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-gold mb-2 tracking-wide subtle-glow">
                IN LOVING MEMORY
              </h1>
              <div className="w-32 h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-4"></div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white mb-4">
                BERNARD MUASYA KASEMA
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl text-gold italic font-medium mb-6">
                “BK”
              </p>
              <p className="text-base sm:text-lg md:text-xl text-gray-200 font-semibold uppercase tracking-wider">
                FATHER • LEADER • MENTOR • CAPTAIN
              </p>
            </div>
          </div>
        </section>

        {/* His Story Section with fade overlay */}
        <section className="relative py-16 md:py-24">
          <div className="absolute inset-0 fade-overlay"></div>
          <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
            <h2 className="text-3xl md:text-4xl text-gold mb-6 subtle-glow">
              LIFE
            </h2>
            <div className="w-32 h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-8"></div>
            <p className="text-gray-200 leading-relaxed text-lg md:text-xl mb-8 max-w-3xl mx-auto">
              It is with deep sorrow and heavy hearts that we remember the life
              of our beloved father, leader, mentor, and captain, Bernard Muasya
              Kasema (BK), who passed following a short period of illness.
            </p>
            <Link
              to="/eulogy"
              className="btn-primary inline-flex items-center space-x-2 font-tt-chocolates"
            >
              <span>Life Story</span>
              <span>→</span>
            </Link>
          </div>
        </section>

        {/* Cherished Memories Section */}
        <section className="relative py-16 md:py-24">
          <div className="absolute inset-0 bg-black/70"></div>
          <div className="relative z-10 max-w-6xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl text-gold mb-6 text-center subtle-glow">
              CHERISHED MEMORIES
            </h2>
            <div className="w-32 h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-12"></div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {previewImages.map((image, index) => (
                <div
                  key={image.id}
                  className="relative overflow-hidden rounded-lg bg-purple-dark/30 border border-gold/20 hover:border-gold/60 transition-all duration-300 cursor-pointer group hover:scale-105 aspect-square animate-fade-in-up"
                  onClick={() => setSelectedImage(index)}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-dark/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link
                to="/gallery"
                className="btn-secondary inline-flex items-center space-x-2 font-tt-chocolates"
              >
                <span>View All Photos</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Tributes Section */}
        <section className="relative py-16 md:py-24">
          <div className="absolute inset-0 bg-black/80"></div>
          <div className="relative z-10 max-w-6xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl text-center text-gold mb-6 subtle-glow">
              WORDS OF REMEMBRANCE
            </h2>
            <div className="w-32 h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-12"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {recentTributes.map((tribute, index) => (
                <Link
                  to={`/tributes#tribute-${tribute.id}`}
                  key={tribute.id}
                  className="bg-purple-dark/50 p-6 rounded-xl border border-gold/20 hover:border-gold/60 transition-all duration-300 hover:scale-105 h-full flex flex-col animate-fade-in-up cursor-pointer"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="text-4xl text-gold/50 mb-3">"</div>
                  <div
                    className="text-gray-200 mb-5 italic flex-grow"
                    dangerouslySetInnerHTML={{
                      __html: truncateHTML(tribute.message, 200),
                    }}
                  />
                  <div className="text-right mt-auto">
                    <p className="text-gold text-md">{tribute.name}</p>
                    <p className="text-sm text-gray-400">
                      {tribute.relationship}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center">
              <Link
                to="/tributes"
                className="btn-primary inline-flex items-center space-x-2 font-tt-chocolates"
              >
                <span>Read More Tributes</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Memorial Information Section */}
        <section className="relative py-16 md:py-24">
          <div className="absolute inset-0 bg-black/90"></div>
          <div className="relative z-10 max-w-4xl mx-auto px-4">
            <div className="bg-purple-dark/50 backdrop-blur-sm border border-gold/30 rounded-2xl p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl text-gold mb-6 subtle-glow">
                MEMORIAL INFORMATION
              </h2>
              <div className="w-32 h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-8"></div>

              <p className="text-gray-200 leading-relaxed text-lg md:text-xl mb-8">
                Find details for the upcoming memorial service, viewing times,
                and other related events to celebrate the life of BK.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <EventCard
                  icon="church"
                  title="NAIROBI MEMORIAL MASS"
                  date="Tuesday, 15th July 2025"
                  location="Don Bosco, Upperhill"
                />
                <EventCard
                  icon="cross"
                  title="FUNERAL SERVICE"
                  date="Wednesday, 16th July 2025"
                  location="St. Teresia, Yatta"
                />
              </div>

              <Link
                to="/information"
                className="btn-primary inline-flex items-center space-x-2 font-tt-chocolates"
              >
                <span>View Full Details</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Full-size modal */}
        {selectedImage !== null && (
          <div
            className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="relative w-auto h-auto max-w-[90vw] max-h-[90vh] animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewImages[selectedImage].src}
                alt={previewImages[selectedImage].alt}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/90 transition-colors text-xl"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        

        <Footer />
      </div>
    </div>
  );
};

export default Index;
