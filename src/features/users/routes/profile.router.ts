import { Router } from "express";
import { ProfileController } from "../controllers/profile.controller";
import { createUploadMiddleware } from "../../../middlewares/upload.middleware";
import { validate } from "../../../middlewares/validate";
import { UpdatePasswordSchema, updateProfileSchema } from "../dto/user.dto";

const router = Router();
const profileController = new ProfileController();

const uploadAvatar = createUploadMiddleware({
  maxFileSizeMB: 2,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
});

router.get("/", profileController.me);

router.put("/update", validate(updateProfileSchema), profileController.patchProfile);

router.patch("/update/avatar", uploadAvatar.single('avatar'), profileController.changeAvatar);

router.patch("/update/banner", uploadAvatar.single('banner'), profileController.changeBanner);
router.delete("/update/banner", profileController.deleteBanner);

router.patch("/update/password", validate(UpdatePasswordSchema), profileController.patchPassword);

export { router as profileRouter }