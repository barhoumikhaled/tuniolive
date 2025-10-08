import { DefaultSeoProps } from "next-seo";

const defaultSEO: DefaultSeoProps = {
  titleTemplate: "%s | TuniOlive - Premium Olive Oil from Tunisia",
  defaultTitle: "TuniOlive - Authentic Tunisian Olive Oil",
  description:
    "Discover the rich taste of Tunisia with TuniOlive. Cold-pressed extra virgin olive oil crafted from the finest Tunisian olives — pure, organic, and full of flavor.",

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.tuniolive.com/",
    site_name: "TuniOlive",
    title: "TuniOlive - Premium Olive Oil from Tunisia",
    description:
      "Experience the authentic taste of Tunisia with TuniOlive — premium extra virgin olive oil from hand-picked Tunisian olives.",
    images: [
      {
        url: "https://www.tuniolive.com/images/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "TuniOlive premium Tunisian olive oil bottle",
      },
    ],
  },

  twitter: {
    handle: "@tuniolive",
    site: "@tuniolive",
    cardType: "summary_large_image",
  },

  additionalMetaTags: [
    {
      name: "keywords",
      content:
        "TuniOlive, Tunisian olive oil, extra virgin olive oil, premium olive oil, Mediterranean olive oil, organic olive oil Tunisia, cold-pressed olive oil",
    },
    {
      name: "author",
      content: "TuniOlive",
    },
  ],
};

export default defaultSEO;
