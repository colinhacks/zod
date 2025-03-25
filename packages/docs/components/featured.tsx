export function Featured() {
  return (
    <div className="w-full flex flex-col items-center">
      <span
        style={{borderBottom: '1px solid hsla(0, 0%, 100%, 0.1)'}}
        className="font-semibold w-full text-center pb-2 border-b border-gray-900 border-solid text-xl"
      >
        Featured sponsor: Clerk
      </span>

      <a href="https://go.clerk.com/PKHrcwh" className="mt-0 mb-0 border-none">
        <picture style={{height: '240px', margin: '12px'}}>
          <source
            media="(prefers-color-scheme: dark)"
            srcSet="https://github.com/colinhacks/zod/assets/3084745/15c8c8be-189d-44ed-b3db-59bf2a21cbe3"
          />
          <img
            alt="mintlify logo"
            src="https://github.com/colinhacks/zod/assets/3084745/15c8c8be-189d-44ed-b3db-59bf2a21cbe3"
            style={{height: '240px'}}
          />
        </picture>
      </a>
      <p className="mt-0 mb-0 text-xs">
        Interested in featuring?{' '}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="mailto:sponsorship@colinhacks.com"
        >
          Get in touch.
        </a>
      </p>
    </div>
  );
}
