import { Router } from "express";
import { validate } from "../../../middlewares/validate";
import { registerSchema } from "./superadmin.validate";
import { SuperAdminController } from "./superadmin.controller";


const router = Router();

router.post("/sa-upsert", validate(registerSchema), SuperAdminController.CreateSuperAdmin);

export { router as SuperAdminRouter }