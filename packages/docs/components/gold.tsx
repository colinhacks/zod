export const Gold = () => {
  const companies = [
    {
      name: "Brand.dev",
      description: "API for logos, colors, and company info",
      logoDark: "https://avatars.githubusercontent.com/brand-dot-dev",
      logoLight: "https://avatars.githubusercontent.com/brand-dot-dev",
      url: "brand.dev",
      href: "https://brand.dev/?utm_source=zod",
    },
    {
      name: "Courier",
      description: "The API platform for sending notifications",
      logoDark: "https://github.com/user-attachments/assets/6b09506a-78de-47e8-a8c1-792efe31910a",
      logoLight: "https://github.com/user-attachments/assets/6b09506a-78de-47e8-a8c1-792efe31910a",
      url: "courier.com",
      href: "https://www.courier.com/?utm_source=zod&utm_campaign=osssponsors",
    },
    {
      name: "Liblab",
      description: "Generate better SDKs for your APIs",
      logoDark: "https://github.com/user-attachments/assets/34dfa1a2-ce94-46f4-8902-fbfac3e1a9bc",
      logoLight: "https://github.com/user-attachments/assets/3de0b617-5137-49c4-b72d-a033cbe602d8",
      url: "liblab.com",
      href: "https://liblab.com/?utm_source=zod",
    },
    {
      name: "Neon",
      description: "Serverless Postgres — Ship faster",
      logoDark: "https://github.com/user-attachments/assets/83b4b1b1-a9ab-4ae5-a632-56d282f0c444",
      logoLight: "https://github.com/user-attachments/assets/b5799fc8-81ff-4053-a1c3-b29adf85e7a1",
      url: "neon.tech",
      href: "https://neon.tech",
    },
    {
      name: "Retool",
      description: "Build AI apps and workflows with Retool AI",
      logoDark: "https://github.com/colinhacks/zod/assets/3084745/ac65013f-aeb4-48dd-a2ee-41040b69cbe6",
      logoLight: "https://github.com/colinhacks/zod/assets/3084745/5ef4c11b-efeb-4495-90a8-41b83f798600",
      url: "retool.com",
      href: "https://retool.com/?utm_source=github&utm_medium=referral&utm_campaign=zod",
    },
    {
      name: "Stainless",
      description: "Generate best-in-class SDKs",
      logoDark: "https://github.com/colinhacks/zod/assets/3084745/f20759c1-3e51-49d0-a31e-bbc43abec665",
      logoLight: "https://github.com/colinhacks/zod/assets/3084745/e9444e44-d991-4bba-a697-dbcfad608e47",
      url: "stainlessapi.com",
      href: "https://stainlessapi.com",
    },
    {
      name: "Speakeasy",
      description: "SDKs & Terraform providers for your API",
      logoDark: "https://r2.zod.dev/Logo_White.svg",
      logoLight: "https://r2.zod.dev/Logo_Black.svg",
      url: "speakeasy.com",
      href: "https://speakeasy.com/?utm_source=zod+docs",
    },
  ];

  return (
    <div className="max-w-4xl mt-4">
      <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-md">
        <div className="grid grid-cols-1 sm:grid-cols-2">
          {companies.map((company) => (
            <div
              key={company.name}
              className="p-4 flex flex-col items-center border-b border-r border-gray-200 dark:border-gray-700 last:border-b-0 "
            >
              <a href={company.href} target="_blank" rel="noopener noreferrer" className="my-0! border-none">
                <img
                  src={company.logoLight}
                  alt={`${company.name} logo (light theme)`}
                  className="my-0! h-16 object-contain dark:hidden"
                />
                <img
                  src={company.logoDark}
                  alt={`${company.name} logo (dark theme)`}
                  className="my-0! h-16 object-contain hidden dark:block"
                />
              </a>

              <p className="mt-3 mb-0 text-center text-sm text-gray-600 dark:text-gray-400">{company.description}</p>
              <a
                href={company.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {company.url}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
