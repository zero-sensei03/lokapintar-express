-- CreateIndex
CREATE INDEX "OtpVerification_email_otpType_idx" ON "OtpVerification"("email", "otpType");
