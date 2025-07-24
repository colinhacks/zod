export const Silver = () => {
  const companies = [
    {
      name: "Subtotal",
      logoSrc: "https://avatars.githubusercontent.com/u/176449348?s=200&v=4",
      url: "subtotal.com",
      href: "https://www.subtotal.com/?utm_source=zod",
    },
    {
      name: "Juno",
      logoSrc: "https://avatars.githubusercontent.com/u/147273133?s=200&v=4",
      url: "juno.build",
      href: "https://juno.build/?utm_source=zod",
    },{
      name: "Nitric",
      logoSrc: "https://avatars.githubusercontent.com/u/72055470?s=200&v=4",
      url: "nitric.io",
      href: "https://nitric.io/",
    },
    {
      name: "PropelAuth",
      logoSrc: "https://avatars.githubusercontent.com/u/89474619?s=200&v=4",
      url: "propelauth.com",
      href: "https://www.propelauth.com/",
    },
    {
      name: "Cerbos",
      logoSrc: "https://avatars.githubusercontent.com/u/80861386?s=200&v=4",
      url: "cerbos.dev",
      href: "https://cerbos.dev/",
    },
    {
      name: "Scalar",
      logoSrc: "https://avatars.githubusercontent.com/u/301879?s=200&v=4",
      url: "scalar.com",
      href: "https://scalar.com/",
    },
    {
      name: "Trigger.dev",
      logoSrc: "https://avatars.githubusercontent.com/u/95297378?s=200&v=4",
      url: "trigger.dev",
      href: "https://trigger.dev",
    },
    {
      name: "Transloadit",
      logoSrc: "https://avatars.githubusercontent.com/u/125754?s=200&v=4",
      url: "transloadit.com",
      href: "https://transloadit.com/?utm_source=zod&utm_medium=referral&utm_campaign=sponsorship&utm_content=github",
    },
    {
      name: "Infisical",
      logoSrc: "https://avatars.githubusercontent.com/u/107880645?s=200&v=4",
      url: "infisical.com",
      href: "https://infisical.com",
    },
    {
      name: "Whop",
      logoSrc: "https://avatars.githubusercontent.com/u/91036480?s=200&v=4",
      url: "whop.com",
      href: "https://whop.com/",
    },
    {
      name: "CryptoJobsList",
      logoSrc: "https://avatars.githubusercontent.com/u/36402888?s=200&v=4",
      url: "cryptojobslist.com",
      href: "https://cryptojobslist.com/",
    },
    {
      name: "Plain",
      logoSrc: "https://avatars.githubusercontent.com/u/70170949?s=200&v=4",
      url: "plain.com",
      href: "https://plain.com/",
    },
    {
      name: "Inngest",
      logoSrc: "https://avatars.githubusercontent.com/u/78935958?s=200&v=4",
      url: "inngest.com",
      href: "https://inngest.com/",
    },
    {
      name: "Storyblok",
      logoSrc: "https://avatars.githubusercontent.com/u/13880908?s=200&v=4",
      url: "storyblok.com",
      href: "https://storyblok.com/",
    },
    {
      name: "Mux",
      logoSrc: "https://avatars.githubusercontent.com/u/16199997?s=200&v=4",
      url: "mux.link/zod",
      href: "https://mux.link/zod",
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-md">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4">
          {companies.map((company) => (
            <div
              key={company.name}
              className="p-4 flex flex-col items-center border-b border-r border-gray-200 dark:border-gray-700 last:border-b-0 sm:last-sm:border-b sm:even:last:border-r-0 lg:nth-3:last-3:border-r-0 xl:nth-4:last-4:border-r-0"
            >
              <a href={company.href} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center">
                <img
                  src={company.logoSrc}
                  alt={`${company.name} logo`}
                  className="h-12 w-12 object-contain mb-2 mt-0"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                  {company.url}
                </span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
