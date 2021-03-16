import { z } from ".";

const run = async () => {
  // const email = z.string().email();
  // console.log(email.safeParse("asdf@alkjsd.com"));
  // console.log(z.string().email().safeParse("SDKLJDSFLKJ"));
  // console.log(z.string().email("test 2").safeParse("SDKLJDSFLKJ"));
  // console.log(
  //   z.string().email({ message: undefined }).safeParse("SDKLJDSFLKJ")
  // );
  const uuid = z.string().uuid("custom error");
  uuid.parse("9491d710-3185-4e06-bea0-6a2f275345e0");
  const result = uuid.safeParse("invalid uuid");
  if (!result.success) {
    console.log(result.error);
  }
};

run();

export {};
