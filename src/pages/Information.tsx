import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Calendar, Clock, MapPin, Users, Heart } from "lucide-react";
import { useState } from "react";
import EventCard from "@/components/EventCard";

interface Update {
  id: number;
  title: string;
  date: string;
  time: string;
  venue: string;
  content: string;
  type: "event" | "announcement" | "service";
}

const Information = () => {
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Update | null>(null);

  const updates: Update[] = [
    {
      id: 1,
      title: "Daily Prayer & Support Gatherings",
      date: "Tuesday 8th — Friday 11th July 2025",
      time: "5:00 PM — 7:30 PM",
      venue: "All Saints' Cathedral, Kenyatta Avenue, Nairobi",
      content:
        "We invite friends and family for daily evening prayers and support gatherings. This will be a time of quiet reflection and mutual comfort. On Friday, July 11th, a special Memorial Service will be held where BK's team, friends, and extended family will be welcome to share their cherished memories.",
      type: "event",
    },
    {
      id: 2,
      title: "Nairobi Memorial Mass",
      date: "Tuesday, 15th July 2025",
      time: "2:00 PM — 3:30 PM",
      venue: "Don Bosco Shrine, Upper Hill, Nairobi",
      content:
        "A formal memorial mass to celebrate the life and legacy of Bernard 'BK' Kasema will be held in Nairobi. All are welcome to join us in this solemn tribute.",
      type: "announcement",
    },
    {
      id: 3,
      title: "Funeral Service & Final Farewell",
      date: "Wednesday, 16th July 2025",
      time: "10:00 AM onwards",
      venue: "St. Teresia Catholic Church, Kithimani, Yatta",
      content:
        "The final funeral service and interment will take place in Yatta, where we will lay our beloved BK to rest. The journey from Nairobi is approximately 1.5 to 1.75 hours.",
      type: "service",
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "announcement":
        return "border-gold/30 bg-gold/10";
      case "event":
        return "border-purple-medium/30 bg-purple-medium/10";
      case "service":
        return "border-gold/30 bg-gold/10";
      default:
        return "border-gold/30 bg-gold/10";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Background with seamless scroll */}
      <div className="fixed inset-0 scroll-bg opacity-30 z-0"></div>

      <Navigation />

      <div className="relative z-10">
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 pt-24">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gold mb-4 uppercase gold-shimmer">
              IMPORTANT DATES & DETAILS
            </h1>
            <div className="w-32 h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-6"></div>
            <p className="text-lg text-gray-300">
              A SCHEDULE OF EVENTS TO HONOR AND CELEBRATE THE LIFE OF BK.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
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

          <div className="space-y-8">
            {updates.map((update) => (
              <article
                key={update.id}
                className={`border rounded-lg p-6 md:p-8 transition-all duration-300 hover:scale-[1.02] hover:border-gold/60 cursor-pointer shadow-lg ${getTypeColor(update.type)}`}
                onClick={() => setSelectedAnnouncement(update)}
              >
                <header className="mb-4">
                  <h3 className="text-xl font-bold text-gold mb-3 uppercase">
                    {update.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{update.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{update.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{update.venue}</span>
                    </div>
                  </div>
                </header>
                <div className="prose prose-gray prose-invert max-w-none mt-4 font-tt-chocolates">
                  <p className="text-gray-300 leading-relaxed">
                    {update.content}
                  </p>
                </div>
              </article>
            ))}
          </div>

          {selectedAnnouncement && (
            <div
              className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
              onClick={() => setSelectedAnnouncement(null)}
            >
              <div
                className="relative bg-black/95 backdrop-blur-md border border-gold/30 rounded-lg shadow-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors text-lg"
                >
                  ✕
                </button>
                <h2 className="text-2xl md:text-3xl font-bold text-gold mb-4 uppercase">
                  {selectedAnnouncement.title}
                </h2>
                <div className="space-y-3 text-gray-300 mb-6">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gold" />
                    <span>{selectedAnnouncement.date}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gold" />
                    <span>{selectedAnnouncement.time}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gold" />
                    <span>{selectedAnnouncement.venue}</span>
                  </div>
                </div>
                <div className="prose prose-lg prose-invert max-w-none text-gray-300 leading-relaxed">
                  {selectedAnnouncement.content}
                </div>
              </div>
            </div>
          )}

          <div className="mt-16 bg-purple-dark/50 backdrop-blur-sm border border-gold/30 rounded-lg p-8 text-center shadow-lg">
            <div className="flex justify-center items-center mb-4">
              <Heart className="w-8 h-8 text-gold" />
            </div>
            <h3 className="text-xl font-bold text-gold mb-4 uppercase">
              A NOTE OF GRATITUDE & SUPPORT
            </h3>
            <p className="text-gray-300 max-w-2xl mx-auto mb-6">
              For those who wish to offer their support to the family during
              this time, your generosity is deeply appreciated. For the love,
              warmth, and kindness you have shown us, we extend our sincerest
              thanks.
            </p>
            <div className="bg-black/50 border border-gold/20 rounded-lg p-4 inline-block">
              <p className="font-semibold text-white">
                Paybill: <span className="text-gold">4161461</span> ('BK
                Farewell')
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Account Number: Your Name
              </p>
            </div>
            <p className="text-2xl font-bold text-gold mt-8 uppercase">
              THE MUASYA FAMILY
            </p>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Information;
