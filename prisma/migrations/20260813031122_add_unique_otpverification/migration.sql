/*
  Warnings:

  - A unique constraint covering the columns `[email,otpType]` on the table `OtpVerification` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "OtpVerification_email_otpType_idx";

-- CreateIndex
CREATE UNIQUE INDEX "OtpVerification_email_otpType_key" ON "OtpVerification"("email", "otpType");
