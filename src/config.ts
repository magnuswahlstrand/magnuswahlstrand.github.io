import type { SocialsObject } from "./types";

export const SITE = {
  website: "https://wahlstrand.dev/",
  author: "Magnus Wahlstrand",
  desc: "A minimal, responsive and SEO-friendly Astro blog theme.",
  title: "wahlstrand.dev",
  ogImage: "default-og.png",
  lightAndDarkMode: true,
  postPerPage: 10,
};

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialsObject = [
  {
    name: "Github",
    href: "https://github.com/magnuswahlstrand",
    active: true,
  },
  {
    name: "Linkedin",
    href: "https://www.linkedin.com/in/magnus-wahlstrand",
    active: true,
  },
  {
    name: "Twitter",
    href: "https://twitter.com/wahlstra",
    active: true,
  }
];
