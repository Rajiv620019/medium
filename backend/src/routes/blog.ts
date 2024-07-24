import { Hono } from "hono";
import { verify } from "hono/jwt";

export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

blogRouter.use("/api/v1/blog/*", async (c, next) => {
  const header = c.req.header("authorization") || "";

  const token = header.split(" ")[1];

  const response = await verify(token, c.env.JWT_SECRET);

  if (response.id) {
    next();
  } else {
    c.status(403);
    return c.json({
      error: "Unauthorized",
    });
  }
});

blogRouter.post("/", (c) => {
  return c.text("blog Route");
});

blogRouter.put("/", (c) => {
  return c.text("update blog Route");
});

blogRouter.get("/", (c) => {
  return c.text("get blog id Route");
});

blogRouter.get("/bulk", (c) => {
  return c.text("get all blogs Route");
});
