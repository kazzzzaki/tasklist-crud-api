const express = require("express");
const db = require("../models/index");
const userRegistValidator = require("./userRegistValidator");
const userUpdateValidator = require("./userUpdateValidator");
const { validationResult } = require("express-validator");

const setupExpressServer = () => {
  /* return configured express app */
  const app = express();

  app.use(express.json());

  //GET Hello
  app.get("/api/hello", function (req, res) {
    res.send("Hello World!");
  });

  ////GET METHOD
  //api/userのパターン
  app.get("/api/user", async function (req, res) {
    let userData;
    if (req.query.limit) {
      if (req.query.offset) {
        userData = await db.user.findAll({
          limit: req.query.limit,
          offset: req.query.offset,
        });
      } else {
        userData = await db.user.findAll({ limit: req.query.limit });
      }
    } else {
      userData = await db.user.findAll();
    }
    res.send(userData);
  });

  //api/user/paramsのパターン
  app.get("/api/user/:idOrName", async function (req, res) {
    const { idOrName } = req.params;
    let userData;
    if (isNaN(idOrName)) {
      //数値型以外の場合はnameで検索する
      userData = await db.user.findAll({
        where: { name: idOrName },
      });
    } else {
      //数値型の場合はwhereで検索する
      userData = await db.user.findAll({ where: { id: idOrName } });
    }
    res.send(userData);
  });

  ////POST METHOD
  app.post("/api/user", userRegistValidator, async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //TODO: いずれ共通化したい。
    if (req.body.name !== undefined) {
      const userCount = await db.user.findAndCountAll({
        where: { name: req.body.name },
      });
      if (userCount.count !== 0) {
        return res.status(400).json({
          errors: [
            {
              value: req.body.name,
              msg: "this user name is already used",
              param: "name",
              location: "body",
            },
          ],
        });
      }
    }
    await db.user.create(req.body);
    const userData = await db.user.findAll({
      where: { name: req.body.name },
    });
    res.status(201).send(userData);
  });

  ////PATCH METHOD
  app.patch("/api/user/:reqId", userUpdateValidator, async function (req, res) {
    const { reqId } = req.params;
    let userData;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        errors: [
          {
            msg: "please request either user name or user token",
            location: "body",
          },
        ],
      });
    }
    //TODO: いずれ共通化したい。
    if (req.body.name !== undefined) {
      const userCount = await db.user.findAndCountAll({
        where: { name: req.body.name },
      });
      if (userCount.count !== 0) {
        return res.status(400).json({
          errors: [
            {
              value: req.body.name,
              msg: "this user name is already used",
              param: "name",
              location: "body",
            },
          ],
        });
      }
    }

    if (isNaN(reqId)) {
      //TODO:数値型以外の場合は現状エラー。今後実装する方法について検討する。
      // const userData = await db.user.update(req.body, {
      //   where: { name: reqId },
      // });
      // if (userData) {
      //   const userData = await db.user.findOne({
      //     where: { name: reqId },
      //   });
      //   res.send(userData);
      // } else {
      res.status(400).send("patch needs id as number");
      // }
    } else {
      //数値型の場合はwhereで検索する
      const userData = await db.user.update(req.body, {
        where: { id: reqId },
      });
      if (userData) {
        const userData = await db.user.findOne({
          where: { id: reqId },
        });
        res.send(userData);
      } else {
        res.status(400).end();
      }
    }
    res.send(userData);
  });

  ////PUT METHOD
  app.put("/api/user/:reqId", async function (req, res) {
    const { reqId } = req.params;
    let userData;
    if (isNaN(reqId)) {
      //TODO:数値型以外の場合は現状エラー。今後実装する方法について検討する。
      // const userData = await db.user.update(req.body, {
      //   where: { name: reqId },
      // });
      // if (userData) {
      //   const userData = await db.user.findOne({
      //     where: { name: reqId },
      //   });
      //   res.send(userData);
      // } else {
      res.status(400).send("put needs id as number");
      // }
    } else {
      //数値型の場合はwhereで検索する
      const userData = await db.user.update(req.body, {
        where: { id: reqId },
      });
      if (userData) {
        const userData = await db.user.findOne({
          where: { id: reqId },
        });
        res.send(userData);
      } else {
        res.status(400).end();
      }
    }
    res.send(userData);
  });

  //DELETE METHOD
  app.delete("/api/user/:reqId", async function (req, res) {
    const { reqId } = req.params;
    const userData = await db.user.destroy({ where: { id: reqId } });
    if (userData) {
      res.status(200).end();
    } else {
      res.status(400).end();
    }
  });

  return app;
};

module.exports = { setupExpressServer };
