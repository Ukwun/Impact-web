import { Calendar } from "lucide-react";

export default function EventsPage() {
  return (
    <div className="container mx-auto px-6 py-24 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-5xl lg:text-6xl font-black text-text-500">
          Upcoming Events
        </h1>
        <p className="text-xl text-gray-300">
          Join our live events, conferences, and networking opportunities
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          {
            title: "ImpactEdu National Summit 2026",
            date: "March 20-22, 2026",
            location: "Lagos Convention Centre",
            attendees: "2,500+",
          },
          {
            title: "Campus Pitch Day",
            date: "April 5, 2026",
            location: "Multiple Campuses",
            attendees: "800+",
          },
          {
            title: "Impact Roundtable",
            date: "March 28, 2026",
            location: "Virtual + Lagos",
            attendees: "500+",
          },
          {
            title: "Entrepreneurship Bootcamp",
            date: "April 15-30, 2026",
            location: "Online",
            attendees: "300+",
          },
        ].map((event) => (
          <div
            key={event.title}
            className="rounded-2xl bg-gradient-to-br from-primary-50 to-secondary-50 border-2 border-primary-200 p-8 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-start gap-3 mb-4">
              <Calendar className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
              <h3 className="text-xl font-black text-text-500">
                {event.title}
              </h3>
            </div>
            <div className="space-y-2 text-sm text-gray-300 ml-9">
              <p><span className="font-semibold">Date:</span> {event.date}</p>
              <p><span className="font-semibold">Location:</span> {event.location}</p>
              <p><span className="font-semibold">Expected Attendees:</span> {event.attendees}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
