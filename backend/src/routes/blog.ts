import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { blogInput, blogUpdateInput } from "@rajiv_786/zod-types-common";
import { Hono } from "hono";
import { verify } from "hono/jwt";

export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

blogRouter.use("/*", async (c, next) => {
  const authHeader = c.req.header("authorization") || "";

  const user = await verify(authHeader, c.env.JWT_SECRET);

  if (user) {
    c.set("userId", user.id);
    await next();
  } else {
    c.status(403);
    return c.json({
      error: "Unauthorized",
    });
  }
});

blogRouter.post("/", async (c) => {
  const body = await c.req.json();

  const { success } = blogInput.safeParse(body);

  if (!success) {
    c.status(411);
    return c.json({
      message: "Incorrect inputs",
    });
  }

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const authorId = c.get("userId");

  try {
    const blog = await prisma.blog.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: authorId,
      },
    });

    return c.json({
      blogId: blog.id,
    });
  } catch (error) {
    c.status(403);
    return c.json({
      error: "Failed",
    });
  }
});

blogRouter.put("/", async (c) => {
  const body = await c.req.json();

  const { success } = blogUpdateInput.safeParse(body);

  if (!success) {
    c.status(411);
    return c.json({
      message: "Incorrect inputs",
    });
  }

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const blog = await prisma.blog.update({
    where: {
      id: body.id,
      // authorId: userId,
    },
    data: {
      title: body.title,
      content: body.content,
    },
  });

  return c.json({
    message: "Blog updated successfully",
    blogId: blog.id,
  });
});

blogRouter.get("/bulk", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const blogs = await prisma.blog.findMany({
    select: {
      content: true,
      title: true,
      id: true,
      author: {
        select: {
          name: true,
        },
      },
    },
  });

  return c.json({
    blogs,
  });
});

blogRouter.get("/:id", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const id = c.req.param("id");

  try {
    const blog = await prisma.blog.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        title: true,
        content: true,
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    return c.json({
      blog: blog,
    });
  } catch (error) {
    c.status(403);
    return c.json({
      error: "Error while fetching blog post",
    });
  }
});
