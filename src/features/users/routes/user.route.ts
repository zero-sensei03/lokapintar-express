import { Router } from "express";
import { authorizeRoles } from "../../../middlewares/auth";
import { UserController } from "../controllers/users.controller";

const router = Router();
const userController = new UserController();

router.get("/", authorizeRoles("SUPERADMIN", "ADMIN"), userController.getAll)
router.get("/:id", authorizeRoles("SUPERADMIN", "ADMIN"), userController.getById)
router.post("/", authorizeRoles("SUPERADMIN", "ADMIN"), userController.createUser)
router.put("/:id", authorizeRoles("SUPERADMIN", "ADMIN"), userController.updateStatus)
router.delete("/:id", authorizeRoles("SUPERADMIN", "ADMIN"), userController.deleteUser)

router.patch("/:id/password", authorizeRoles("SUPERADMIN", "ADMIN"), userController.updatePassword)
router.patch("/:id/status", authorizeRoles("SUPERADMIN", "ADMIN"), userController.updateStatus)
router.patch("/:id/restore", authorizeRoles("SUPERADMIN", "ADMIN"), userController.restoreUser)
router.delete("/:id/permanent", authorizeRoles("SUPERADMIN", "ADMIN"), userController.permanentlyDelete)

export { router as UserRouter }