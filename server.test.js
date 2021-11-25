const request = require("supertest");
const app = require("./server");

it("should run", async () => {
  response = await request(app).get("/");
  expect(response.statusCode).toBe(200);
});
it("visit an invalid url", async () => {
  response = await request(app).get("/abcde");
  expect(response.statusCode).toBe(404);
});
