export interface SiteContent {
  hero: {
    tagline: string;
    title: string;
    description: string;
  };
  about: {
    title: string;
    description: string;
    stats: Array<{
      value: string;
      label: string;
    }>;
  };
  capabilities: {
    tagline: string;
    title: string;
    description: string;
    list: Array<{
      title: string;
      description: string;
      icon: string; // Storing string identifier for icon
    }>;
  };
  services: {
    tagline: string;
    title: string;
    description: string;
    list: Array<{
      title: string;
      description: string;
    }>;
  };
  projects: {
    tagline: string;
    title: string;
    description: string;
  };
  contact: {
    tagline: string;
    title: string;
    heading: string;
    description: string;
    email: string;
    phone: string;
    location: string;
  };
  siteSettings: {
    companyName: string;
  };
}
