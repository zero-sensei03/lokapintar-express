import { Router } from "express";
import { authorizeRoles } from "../../../middlewares/auth";
import { UserController } from "../controllers/users.controller";

const router = Router();
const userController = new UserController();

router.get("/", authorizeRoles("SUPERADMIN", "ADMIN"), userController.getAll)

export { router as UserRouter }