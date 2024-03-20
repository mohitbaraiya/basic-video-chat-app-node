import { Router } from "express";

export class BaseRouter {
  router: Router;

  constructor() {
    this.router = Router();
    this.#init();
    
  }

  //   init router
  #init() {
    this.router.get("/hey", (req, res) => {
      // req.newVar = "";
      res.send(`<h1>Hello world</h1>`);
    });
  }
}
