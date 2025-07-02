export const Platinum = () => {
  return (
    <div className="w-full max-w-5xl mx-auto border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="p-4 text-center">
          <a href="https://www.mobb.ai/?utm_source=zod">
            <div className="w-full py-2 pb-0 flex justify-center items-center dark:border-gray-700">
            <img
                className="m-0! hidden dark:block h-20 object-contain"
                alt="Mobb logo"
                src="https://i.imgur.com/3ixYoUf.png"
              />
              <img
                className="m-0! block dark:hidden h-20 object-contain"
                alt="Mobb logo"
                src="https://i.imgur.com/u1nWypQ.png"
              />
              {/* <img
                className="m-0! h-20 object-contain"
                alt="Mobb logo"
                src="https://i.imgur.com/Iej7VUf.png"
              /> */}
            </div>
          </a>
          <p className="text-lg font-medium text-gray-800 dark:text-gray-200 pt-2 pb-1 m-0!">
            Automatically fix code vulnerabilities within GitHub in seconds
          </p>
          <p className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 m-0!">
            <a href="https://www.mobb.ai/?utm_source=zod" className="transition-colors duration-200">
              mobb.ai
            </a>
          </p>
        </div>
        <div className="p-4 text-center">
          <a href="https://www.coderabbit.ai/">
            <div className="w-full py-2 pb-0 flex justify-center items-center dark:border-gray-700">
              <img
                className="m-0! hidden dark:block h-20 object-contain"
                alt="CodeRabbit logo"
                src="https://github.com/user-attachments/assets/eea24edb-ff20-4532-b57c-e8719f455d6d"
              />
              <img
                className="m-0! block dark:hidden h-20 object-contain"
                alt="CodeRabbit logo"
                src="https://github.com/user-attachments/assets/d791bc7d-dc60-4d55-9c31-97779839cb74"
              />
            </div>
          </a>
          <p className="text-lg font-medium text-gray-800 dark:text-gray-200 pt-2 pb-1 m-0!">
            Cut code review time & bugs in half
          </p>
          <p className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 m-0!">
            <a href="https://www.coderabbit.ai/" className="transition-colors duration-200">
              coderabbit.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
