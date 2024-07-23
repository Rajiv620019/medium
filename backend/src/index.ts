import { Hono } from "hono";

const app = new Hono();

app.post("/api/v1/user/signup", (c) => {
  return c.text("signup Route");
});

app.post("/api/v1/user/signin", (c) => {
  return c.text("signin Route 2");
});

app.post("/api/v1/blog", (c) => {
  return c.text("blog Route");
});

app.put("/api/v1/user/blog", (c) => {
  return c.text("update blog Route");
});

app.get("/api/v1/blog/:id", (c) => {
  return c.text("get blog id Route");
});

app.get("/api/v1/blog/bulk", (c) => {
  return c.text("get all blogs Route");
});

export default app;
