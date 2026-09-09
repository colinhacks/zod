export const Platinum = () => {
  const companies = [
    // {
    //   name: "Mobb",
    //   description: "Automatically fix code vulnerabilities within GitHub in seconds",
    //   logoDark: "https://i.imgur.com/3ixYoUf.png",
    //   logoLight: "https://i.imgur.com/u1nWypQ.png",
    //   url: "mobb.ai",
    //   href: "https://www.mobb.ai/?utm_source=zod",
    // },
    {
      name: "Trigger.dev",
      description: "Build and deploy fully-managed AI agents and workflows",
      logoDark: "https://trigger.dev/docs/logo/dark.png",
      // pinned: trigger.dev ships no light-mode wordmark, and this svg's jsx-cased gradient stops make it render solid black
      logoLight: "https://cdn.jsdelivr.net/gh/triggerdotdev/trigger.dev@c719f84f03bfa2bb4f13fa35251725ed5046a139/apps/webapp/app/assets/images/logo.svg",
      url: "trigger.dev",
      href: "https://trigger.dev/?utm_source=zod",
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {companies.map((company) => (
          <div key={company.name} className="p-4 text-center">
            <a href={company.href}>
              <div className="w-full py-2 pb-0 flex justify-center items-center dark:border-gray-700">
                <img
                  className="m-0! hidden dark:block h-20 object-contain"
                  alt={`${company.name} logo (dark theme)`}
                  src={company.logoDark}
                />
                <img
                  className="m-0! block dark:hidden h-20 object-contain"
                  alt={`${company.name} logo (light theme)`}
                  src={company.logoLight}
                />
              </div>
            </a>
            <p className="text-lg font-medium text-gray-800 dark:text-gray-200 pt-2 pb-1 m-0!">
              {company.description}
            </p>
            <p className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 m-0!">
              <a href={company.href} className="transition-colors duration-200">
                {company.url}
              </a>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
