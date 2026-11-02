import WordSeparate from "./WordSeparate";
import ExperienceCard from "./ExperienceCard";

// One object per job/internship, most recent first.
const experiences = [
  {
    company: "Lyter",
    role: "Freelance Software Developer",
    date: "June 2026 - Present",
    location: "Nantes, France · Remote",
    description:
      "AI ghostwriter for LinkedIn: generates post ideas, writes in the user's own style, schedules publications at the best time and creates custom visuals. Freelance mission on the product itself.",
    logoUrl: "/logos/experience/Lyter.png",
    websiteUrl: "https://www.lyter.ai",
    achievements: [
      "Develop features end to end, from the Flutter screens (iOS, Android and web) to the Node.js Cloud Functions and the Firestore data model.",
      "Improved the AI visual generation workflow: prompt handling, visual styles and image history for the posts.",
      "Work on the onboarding and free-trial funnel, with the product analytics needed to measure activation.",
    ],
    tech: ["Node.js", "JavaScript", "Flutter", "Firebase"],
  },
  {
    company: "Homerez",
    role: "Software Engineering Intern",
    date: "April 2026 - August 2026",
    location: "Paris, France",
    description:
      "Holiday rental management company that rents out individual owners' properties across Europe, handling listings, bookings and pricing on Airbnb, Booking.com and 20+ other platforms.",
    logoUrl: "/logos/experience/Homerez.png",
    websiteUrl: "https://www.homerez.com",
    achievements: [
      "Shipped a steady stream of product tickets across the stack, from the React frontend to the Node.js / TypeScript API and MongoDB data layer.",
      "Integrated AI into the listing pipeline to improve owners' photos: automatic selection, scoring and cleanup of the images used on the ads.",
    ],
    tech: ["Node.js", "TypeScript", "MongoDB", "React", "Python"],
  },
];

const HomeExperience = () => {
  return (
    <div id="experience">
      <WordSeparate
        htmlTag="h2"
        text="My Experience"
        className="physical text-4xl font-bold mb-4"
        parentClassName="w-full flex justify-center mt-20"
      />

      <div className="relative mt-10 w-full flex flex-col justify-center items-center gap-14">
        {experiences.map((experience, index) => (
          <ExperienceCard key={index} {...experience} />
        ))}
      </div>
    </div>
  );
};

export default HomeExperience;
