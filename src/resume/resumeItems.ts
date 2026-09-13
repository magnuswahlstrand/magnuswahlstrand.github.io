import type { ResumeItem } from "../types/resumeItems";

export function nowDate(): string {
  const now = new Date();
  return now.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export const resumeItems: ResumeItem[] = [
  {
    type: "Freelance",
    company: {
      name: "TV4 Play",
      linkedin: "https://www.linkedin.com/company/tv4/",
    },
    isOngoing: true,
    roles: [
      {
        title: "Senior Backend Developer — Recommendations",
        description:
          "I lead the team responsible for recommendations and personalization at TV4 Play. " +
          "We build and operate the systems that deliver tailored content to viewers.",
        from: "May 2025",
        to: nowDate(),
        tags: [
          "Recommendations",
          "Node.js",
          "TypeScript",
          "Go",
          "AWS",
          "DynamoDB",
          "Athena",
          "S3",
        ],
      },
      {
        title: "Senior Backend Developer — User & Authentication",
        description:
          "Team lead in the User and Authentication team at TV4 Play. " +
          "We built and maintained the systems for authentication, profile management, and secure customer data handling in Sweden and Finland.",
        from: "June 2024",
        to: "May 2025",
        tags: [
          "Node.js",
          "TypeScript",
          "AWS",
          "DynamoDB",
          "PostgreSQL",
          "Observability",
          "Grafana",
        ],
      },
    ],
  },
  {
    type: "Freelance",
    company: {
      name: "Creator Studio",
      linkedin: "https://www.linkedin.com/company/thisisyourstudio/mycompany/",
    },
    roles: [
      {
        location: "Stockholm, Sweden",
        title: "Senior Developer",
        description:
          "Developed and operated payment solutions for Creator Studio, H&M Group's print-on-demand merchandise platform. As part of the Payments & Reporting team, I built integrations with the existing ERP system and systems for financial reporting.",
        from: "Jan 2022",
        to: "June 2024",
        tags: [
          "Python",
          "TypeScript",
          "Kafka",
          "Kubernetes",
          "GCP",
          "Adyen",
          "PostgreSQL",
          "MongoDB",
        ],
      },
    ],
  },
  {
    type: "Freelance",
    company: {
      name: "SEB",
      linkedin: "https://www.linkedin.com/company/seb/",
    },
    roles: [
      {
        location: "Stockholm, Sweden",
        title: "Senior Software Engineer",
        description:
          "Designed API gateway solutions in SEB's API Governance team. Migrated over 100 APIs from a proprietary gateway to an open-source alternative, on time and with minimal downtime, using Go, TypeScript, OpenShift, and GCP.",
        from: "May 2021",
        to: "Jan 2022",
        tags: ["Go", "TypeScript", "OpenShift", "Kong", "GCP"],
      },
    ],
  },
  {
    type: "Full-time",
    company: {
      name: "P.F.C.",
      linkedin: "https://www.linkedin.com/company/getpfc/",
    },
    roles: [
      {
        location: "Stockholm, Sweden",
        title: "Senior Software Developer",
        description:
          "Developed and operated Go services for a mobile banking app, with responsibility for platform architecture and evolution. Led the replacement of the card issuer and processor, completing the project three weeks ahead of schedule.",
        from: "May 2019",
        to: "May 2021",
        tags: ["Go", "DevOps", "Docker", "PostgreSQL", "AWS", "Heroku"],
      },
    ],
  },
  {
    type: "Full-time",
    company: {
      name: "Ericsson",
      linkedin: "https://www.linkedin.com/company/ericsson/",
    },
    roles: [
      {
        location: "Stockholm, Sweden",
        title: "Project Manager & Team Lead",
        description:
          "Led a team working on Ericsson's first 5G rollouts in China, then a virtualized radio access network project for larger-scale rollouts. The latter involved twelve development teams across Sweden, Poland, China, and Korea.",
        from: "Oct 2016",
        to: "May 2019",
        tags: ["Go", "Python", "OpenStack", "RabbitMQ", "C++"],
      },
      {
        location: "Stockholm, Sweden",
        title: "Developer & Team Lead",
        description:
          "Developed control systems and automated tests for GSM and WCDMA base stations, and coordinated planning as team lead and scrum master. Created a web-based test-results visualization tool used daily by over 500 project members.",
        from: "Aug 2013",
        to: "Oct 2016",
        tags: ["C++", "Java", "Python", "UML modelling", "Linux"],
      },
      {
        location: "Linköping, Sweden",
        title: "Junior Developer",
        description:
          "Developed features for Ericsson's 4G base stations, focusing on automatic system configuration and early warning systems for natural disasters.",
        from: "Jan 2012",
        to: "Aug 2013",
        tags: ["Java", "UML modelling", "ClearCase"],
      },
    ],
  },
];

export function calculateDuration(from: string, to: string): string {
  const fromDate = new Date(from);
  const toDate = new Date(to);

  const years = toDate.getFullYear() - fromDate.getFullYear();
  const months = toDate.getMonth() - fromDate.getMonth();

  const totalMonths = years * 12 + months;
  const numYears = Math.floor(totalMonths / 12);
  const numMonths = totalMonths % 12;

  const yearString =
    numYears > 0 ? `${numYears} year${numYears > 1 ? "s" : ""}` : "";
  const monthString =
    numMonths > 0 ? `${numMonths} month${numMonths > 1 ? "s" : ""}` : "";

  return `${yearString}${
    numYears > 0 && numMonths > 0 ? " " : ""
  }${monthString}`;
}
