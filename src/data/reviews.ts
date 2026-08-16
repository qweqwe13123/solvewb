export type Review = {
  id: string;
  rating: number;
  body: string;
  authorInitials: string;
  location: string;
  services: string[];
  date: string;
  response: string;
};

export const REVIEWS: Review[] = [
  {
    id: "bh",
    rating: 5,
    body: "We manage a chain of small hotels and were in serious need of an overhaul of our internal processes. In California, client background checks and collecting application fees prior to confirming a booking are very important to us. Solver developed custom software for us that combined client data verification, a payment system, and the booking process into one convenient platform. The entire process now runs much faster and more professionally. It has become easier for guests to book rooms, and our team has gained more accurate data and better control over operations. We have also noticed growth in direct bookings and a reduction in manual work. Honestly, we didn't expect to be this impressed with the result. Fantastic work and a very professional approach at every stage of the project.",
    authorInitials: "B.H.",
    location: "Los Angeles, California",
    services: [
      "Custom Software",
      "Payment Systems",
      "CRM & Workflow Integration",
      "Maintenance & Support",
    ],
    date: "August 14, 2025",
    response:
      "B.H., we are very glad to hear that our custom solution has brought such great benefits to your hotel chain. Creating efficient booking and client management systems is what we do best. We are proud to have helped you enhance the guest experience and optimize your operations. Thank you for your trust and for choosing Solver!",
  },
  {
    id: "ra",
    rating: 5,
    body: "Our real estate business was in serious need of an overhaul. Solver developed a new website, mobile app, CRM system, and lead processing automation for us. Now all inquiries come into one system, and our agents can quickly track clients and deals. The app made client interaction much more convenient, and automation eliminated a large amount of manual work. As a result, we process requests faster, have better control over processes, and can devote more time to sales. Very pleased with the result and how professionally the team approached the project. Highly recommend.",
    authorInitials: "R.A.",
    location: "Miami, Florida",
    services: [
      "Web & Mobile Development",
      "CRM & Workflow Integration",
      "Business Automation",
      "Reputation Management",
    ],
    date: "January 15, 2026",
    response:
      "R.A., thank you for such a detailed review! We are glad we were able to provide a comprehensive solution that transformed your real estate operations. Our goal is to give your agents the tools to achieve greater success, and we are happy that we accomplished this. We appreciate your trust and look forward to future projects!",
  },
  {
    id: "mk",
    rating: 4,
    body: "We owned a small restaurant and were struggling to attract new customers. Solver helped us with branding and building a new website with a convenient online ordering system. They also improved our online visibility and helped automate the collection of Google reviews. We now regularly receive new reviews, our rating has grown noticeably, and along with it, customer trust. Over the past few months, the number of orders has increased significantly and the business looks much more professional. Thank you so much for the work done. I don't even know how to express my gratitude. I will definitely reach out again in the future, possibly about a mobile app. You're the best!",
    authorInitials: "M.K.",
    location: "Chicago, Illinois",
    services: ["Branding & Web Design", "E-Commerce Solutions", "Reputation Management"],
    date: "January 28, 2026",
    response:
      "M.K., thank you so much for your review! We were happy to help your restaurant stand out in the digital space and attract more visitors. Seeing your business grow and your online presence improve is the best reward for us. We value your partnership and wish you continued success!",
  },
  {
    id: "dl",
    rating: 5,
    body: "First of all, I would like to thank Bryan for his professionalism, patience, and courtesy. He carefully listened to all of our requirements, answered every question we had, and made the entire process smooth and stress-free. It was truly a pleasure working with him. I would also like to thank the entire Solver team for their fast and efficient work. Our old website was outdated, and managing client information had become increasingly difficult. The team developed a modern website and mobile application that now allows our clients to book appointments with ease. In addition, they implemented an automated review collection system and streamlined many routine processes, allowing our administrators to focus more on clients instead of administrative tasks. Since implementing these solutions, the number of new inquiries has increased by more than 50%, and the amount of positive online reviews has grown significantly. True professionals. Thank you to Bryan and the entire Solver team for your outstanding work!",
    authorInitials: "D.L.",
    location: "Los Angeles, California",
    services: [
      "Web & Mobile Development",
      "CRM & Workflow Integration",
      "Business Automation",
      "Reputation Management",
    ],
    date: "February 12, 2026",
    response:
      "D.L., thank you for your thoughtful review and for recognizing Bryan and our team. We are thrilled that your new website, mobile app, and automation tools have driven such strong growth in inquiries and reviews. It was a pleasure supporting your practice. Thank you for choosing Solver!",
  },
  {
    id: "st",
    rating: 4,
    body: "We are a law firm and needed a reliable system for managing inquiries and maintaining a professional image. They built a new website and implemented a virtual receptionist that handles initial calls and inquiries. This significantly reduced the workload on our staff and improved clients' first impressions. Highly recommend.",
    authorInitials: "S.T.",
    location: "New York, New York",
    services: ["Branding & Web Design", "Virtual Receptionist", "Reputation Management"],
    date: "December 8, 2025",
    response:
      "S.T., we greatly appreciate your review! It was an honor to help your law firm strengthen its online presence and streamline client interactions. We are glad that our solutions, especially the virtual receptionist, have been so beneficial to you. Thank you for your trust and recommendation!",
  },
  {
    id: "kd",
    rating: 4,
    body: "Our e-commerce store faced problems with payment processing and inventory management. Solver integrated a new payment system and helped us automate inventory tracking. This significantly accelerated our operations and reduced the number of errors. Customers are now happy with a faster and smoother purchasing experience. Excellent support and quick solutions.",
    authorInitials: "K.D.",
    location: "Seattle, Washington",
    services: [
      "Payment Systems",
      "E-Commerce Solutions",
      "Business Automation",
      "Maintenance & Support",
    ],
    date: "November 22, 2025",
    response:
      "K.D., thank you for your review! We are glad we were able to improve the efficiency of your e-commerce store and make the purchasing process more enjoyable for your customers. Our team is always ready to ensure your systems run smoothly. We value your partnership!",
  },
  {
    id: "av",
    rating: 5,
    body: "We needed professional branding and a website that would reflect our values. They also set up a lead management system, which allowed us to better track potential clients and respond to inquiries faster. This significantly improved our organization and helped us grow.",
    authorInitials: "A.V.",
    location: "Austin, Texas",
    services: ["Branding & Web Design", "CRM & Workflow Integration", "Reputation Management"],
    date: "November 3, 2025",
    response:
      "A.V., we are very glad we were able to support your consulting startup during its formative stage. Building a strong brand and an effective lead management system is key to success, and we are proud to have been part of that process. We wish you prosperity and thank you for choosing Solver!",
  },
  {
    id: "gp",
    rating: 5,
    body: "Our construction business always relied on word of mouth, but we realized we needed to improve our online presence. Solver developed a simple yet effective website for us and helped us start collecting reviews. We now get more inquiries through the website, and our online reputation has improved significantly. Straightforward and clear work.",
    authorInitials: "G.P.",
    location: "Denver, Colorado",
    services: ["Web & Mobile Development", "Reputation Management"],
    date: "October 17, 2025",
    response:
      "G.P., thank you for your review! We are glad we were able to help your construction business expand its online presence and attract new clients. We believe that even small changes can bring great results. Thank you for your trust!",
  },
  {
    id: "op",
    rating: 4,
    body: "First of all, I would like to thank Olivia for being incredibly professional, responsive, and helpful throughout the entire process. I'd also like to thank the entire Solver team. They helped us automate content creation for our blog and social media, which used to take up a significant amount of time. We now have a system that generates ideas and draft content, helping us reduce workload and improve efficiency. The team also improved our website, making it more user-friendly and professional. We are very satisfied with the results and would gladly recommend Solver to other businesses.",
    authorInitials: "O.P.",
    location: "London, United Kingdom",
    services: ["Content Automation", "Web & Mobile Development", "Digital Operations"],
    date: "September 29, 2025",
    response:
      "O.P., thank you for your kind words about Olivia and our team. We are glad our content automation and website improvements helped you save time and present your brand more professionally. We appreciate your recommendation and partnership!",
  },
  {
    id: "iv",
    rating: 5,
    body: "Solver did an excellent job creating a modern and attractive design. They also helped us with reputation management, and we now receive more positive reviews, which leads to an increase in calls. Very professional and effective.",
    authorInitials: "I.V.",
    location: "Dubai, UAE",
    services: ["Branding & Web Design", "Reputation Management", "Web & Mobile Development"],
    date: "September 6, 2025",
    response:
      "I.V., thank you for your review! We are glad we were able to help your local services business refresh its image and attract more clients. Your satisfaction is our primary goal. We value your trust and wish you continued prosperity!",
  },
];

const averageRaw = REVIEWS.reduce((sum, r) => sum + r.rating, 0) / REVIEWS.length;

export const REVIEW_STATS = {
  average: Math.round(averageRaw * 10) / 10,
  total: REVIEWS.length,
  distribution: [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: REVIEWS.filter((r) => r.rating === stars).length,
  })),
};
