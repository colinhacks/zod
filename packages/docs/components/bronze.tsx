export const Bronze = () => {
  const companies = [
    {
      name: "Val Town",
      logoSrc: "https://github.com/user-attachments/assets/95305fc4-4da6-4bf8-aea4-bae8f5893e5d",
      url: "val.town",
      href: "https://www.val.town/",
    },
    {
      name: "Route4Me",
      logoSrc: "https://avatars.githubusercontent.com/u/7936820?s=200&v=4",
      url: "route4me.com",
      href: "https://www.route4me.com/",
    },
    {
      name: "Encore",
      logoSrc: "https://github.com/colinhacks/zod/assets/3084745/5ad94e73-cd34-4957-9979-37da85fcf9cd",
      url: "encore.dev",
      href: "https://encore.dev",
    },
    {
      name: "Replay",
      logoSrc: "https://avatars.githubusercontent.com/u/60818315?s=200&v=4",
      url: "replay.io",
      href: "https://www.replay.io/",
    },
    {
      name: "Numeric",
      logoSrc: "https://i.imgur.com/kTiLtZt.png",
      url: "numeric.io",
      href: "https://www.numeric.io",
    },
    {
      name: "Marcato Partners",
      logoSrc: "https://avatars.githubusercontent.com/u/84106192?s=200&v=4",
      url: "marcatopartners.com",
      href: "https://marcatopartners.com",
    },
    {
      name: "Interval",
      logoSrc: "https://avatars.githubusercontent.com/u/67802063?s=200&v=4",
      url: "interval.com",
      href: "https://interval.com",
    },
    {
      name: "Seasoned",
      logoSrc: "https://avatars.githubusercontent.com/u/33913103?s=200&v=4",
      url: "seasoned.cc",
      href: "https://seasoned.cc",
    },
    {
      name: "Bamboo Creative",
      logoSrc: "https://avatars.githubusercontent.com/u/41406870?v=4",
      url: "bamboocreative.nz",
      href: "https://www.bamboocreative.nz/",
    },
    {
      name: "Jason Laster",
      logoSrc: "https://avatars.githubusercontent.com/u/254562?v=4",
      url: "github.com/jasonLaster",
      href: "https://github.com/jasonLaster",
    },
    {
      name: "Clipboard",
      logoSrc: "https://avatars.githubusercontent.com/u/28880063?s=200&v=4",
      url: "clipboardhealth.com/engineering",
      href: "https://www.clipboardhealth.com/engineering",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-md">
        <div className="flex flex-wrap">
          {companies.map((company) => (
            <div
              key={company.name}
              className="p-4 flex flex-col items-center border-b border-r border-gray-200 dark:border-gray-700 last:border-b-0 sm:last-sm:border-b sm:even:last:border-r-0 lg:nth-3:last-3:border-r-0 xl:nth-4:last-4:border-r-0"
            >
              <a
                href={company.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center m-0 border-none"
              >
                <img src={company.logoSrc} alt={`${company.name} logo`} className="h-12 object-contain mb-0 mt-0" />
              </a>
              <a href={company.href} className="hidden">
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
