// const { describe, test } = require("node:test");
const { deepStrictEqual } = require("node:assert");

const request = require("supertest");

const app = require("../../app");
const { mongoConnect, mongoDisconnect } = require("../../services/mongo");

describe("Launches API", () => {
  beforeAll(async () => {
    await mongoConnect();
  });

  afterAll(async () => {
    await mongoDisconnect();
  });

  describe("Test GET /launches", () => {
    test("It should respond with 200 success", async () => {
      const response = await request(app)
        .get("/v1/launches")
        .expect("Content-Type", /json/)
        .expect(200);
    });
  });

  describe("Test POST /launches", () => {
    const completeLaunchData = {
      mission: "USS Enterprise",
      rocket: "FeiTian",
      target: "Kepler-296 A f",
      launchDate: "January 25, 2028",
    };

    const launchDataWithoutDate = {
      mission: "USS Enterprise",
      rocket: "FeiTian",
      target: "Kepler-296 A f",
    };

    const launchDataWithInvalidDate = {
      mission: "USS Enterprise",
      rocket: "FeiTian",
      target: "Kepler-296 A f",
      launchDate: "zoot",
    };

    test("It should respond with 201 created", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(completeLaunchData)
        .expect("Content-Type", /json/)
        .expect(201);

      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();
      deepStrictEqual(requestDate, responseDate);

      const { mission, rocket, target } = response.body;
      deepStrictEqual({ mission, rocket, target }, launchDataWithoutDate);
    });

    test("It should catch missing required properties", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDataWithoutDate)
        .expect("Content-Type", /json/)
        .expect(400);

      deepStrictEqual(response.body, {
        error: "Missing required launch property",
      });
    });

    test("It should catch invalid dates", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDataWithInvalidDate)
        .expect("Content-Type", /json/)
        .expect(400);

      deepStrictEqual(response.body, {
        error: "Invalid launch date",
      });
    });
  });
});
