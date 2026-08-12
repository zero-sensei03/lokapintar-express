import "dotenv/config";
import express from "express";
import { prisma } from "../libs/prisma";
import { errorHandler } from "../middlewares/errorHandler";
import { authenticate, authorizeRoles } from "../middlewares/auth"
import { Env } from "./Env";
import { formatDateTime, getTimezoneFromReq } from "../utils/date";
import { sendSuccess } from "../utils/response";
import { corsMiddleware } from "./cors";
import { router } from "./router";

const PORT = Env.PORT;

const app = express();
app.use(corsMiddleware)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Public Route (Dengan contoh Timezone Dinamis)
app.use("/api", router)

// Protected Route: Khusus User terautentikasi
app.get("/profile", authenticate, async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    const timezone = getTimezoneFromReq(req);

    return sendSuccess(res, "Profile user", {
      ...user,
      createdAtFormatted: formatDateTime(user!.createdAt, timezone),
    });
  } catch (err) {
    next(err);
  }
});

// Protected Route Khusus Admin / Educator
app.get(
  "/admin/dashboard",
  authenticate,
  authorizeRoles("SUPERADMIN", "EDUCATOR"),
  async (_req, res) => {
    return sendSuccess(res, "Selamat datang di Dashboard Educator/Admin");
  }
);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});