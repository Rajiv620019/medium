import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign, verify } from "hono/jwt";

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

app.use("/api/v1/blog/*", async (c, next) => {
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

app.post("/api/v1/user/signup", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();

  try {
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password,
      },
    });

    const jwt = await sign(
      {
        id: user.id,
      },
      c.env.JWT_SECRET
    );

    return c.json({
      token: jwt,
    });
  } catch (error) {
    c.status(403);
    return c.json({
      error: "Error while signing up",
    });
  }
});

app.post("/api/v1/user/signin", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = c.req.json();
  const user = await prisma.user.findUnique({
    where: {
      email: body.email,
    },
  });

  if (!user) {
    c.status(403);
    return c.json({
      error: "User not found",
    });
  }

  const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);

  return c.json({
    token: jwt,
  });
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
