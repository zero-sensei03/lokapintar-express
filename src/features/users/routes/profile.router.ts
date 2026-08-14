import { Router } from "express";
import { ProfileController } from "../controllers/profile.controller";
import { createUploadMiddleware } from "../../../middlewares/upload.middleware";

const router = Router();
const profileController = new ProfileController();

const uploadAvatar = createUploadMiddleware({
  maxFileSizeMB: 2,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
});

router.get("/", profileController.me);
router.patch("/update/avatar", uploadAvatar.single('avatar'), profileController.changeAvatar);

export { router as profileRouter }