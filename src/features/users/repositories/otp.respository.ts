import { Prisma } from "../../../generated/prisma/client";
import { OTPType } from "../../../generated/prisma/enums";

interface OtpModel {
    otpType: OTPType
    otpHash: string;
    email: string;
    createdAt: Date;
    expiredAt: Date;
}

export class OTPRepository {
    async upsertOTP(prisma: Prisma.TransactionClient, payload: OtpModel): Promise<{ createdAt: Date, expiredAt: Date }> {
        return await prisma.otpVerification.upsert({
            where: {
                email_otpType: {
                    email: payload.email,
                    otpType: payload.otpType
                }
            },
            create: payload,
            update: payload,
            select: {
                createdAt: true,
                expiredAt: true
            }
        });
    }

    async getOtp(prisma: Prisma.TransactionClient, email: string, otpType: OTPType): Promise<OtpModel | null> {
        return await prisma.otpVerification.findUnique({
            where: {
                email_otpType: {
                    email,
                    otpType
                }
            },
            select: {
                email: true,
                otpHash: true,
                otpType: true,
                expiredAt: true,
                createdAt: true
            }
        })
    }
}