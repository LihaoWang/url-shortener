const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");

it("should run", (done) => {
  request(app).get("/").expect(200, done);
});
// it("visit an invalid url", async () => {
//   response = await request(app).get("/abcde");
//   expect(response.statusCode).toBe(404);
// });
after(function (done) {
  mongoose.connection.close();
  done();
});
