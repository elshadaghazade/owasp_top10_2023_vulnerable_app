export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "OWASP TOP 10 2023",
  description:
    "OWASP-top-10-2023",
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Doc",
      href: "/api-doc",
    },
  ],
  links: {
    twitter: "https://twitter.com/",
    github: "https://github.com/",
    docs: "/api-doc",
  },
}
