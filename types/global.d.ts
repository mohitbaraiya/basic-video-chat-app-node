import "express";

declare global {
  function myCustomFunction(req: string, res?: number): void;
  //   namespace NodeJS {
  //     interface ProcessEnv {
  //       // Define custom environment variables
  //       SECRET: string | null;
  //       MY_ENVIRONMENT_VARIABLE: "value1" | "value2" | "value3" | null;
  //     }
  //     interface Global {
  //       var: string;
  //     }
  //   }
  namespace Express {
    interface Request {
      newVar: string;
    }
  }
}

export {};
