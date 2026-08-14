import { sendRegistrationOtpEmail } from "../../../libs/email";
import { prisma } from "../../../libs/prisma";
import { AppError } from "../../../utils/AppError";
import { comparePassword, hashPassword } from "../../../utils/bcrypt";
import { generateAuthTokens, verifyAccessToken, verifyRefreshToken } from "../../../utils/jwt";
import { generateOTP } from "../../../utils/otp";
import { RequestLoginDTO, RequestRegisterDTO, RequestResetDTO } from "../dto/auth.dto";
import { RequestOTPVerifyDTO } from "../dto/otp.dto";
import { OTPRepository } from "../repositories/otp.respository";
import { UserModel, UserRepository } from "../repositories/user.respository";

export class AuthService {
    private otpRepository: OTPRepository;
    private userRepository: UserRepository;


    constructor() {
        this.otpRepository = new OTPRepository();
        this.userRepository = new UserRepository();
    }

    async register (dto: RequestRegisterDTO) {
        const normalizedEmail = dto.email.trim().toLowerCase();

        const regEmailCheck = await this.userRepository.getUserByEmail(prisma, normalizedEmail);
        if(regEmailCheck) throw new AppError(`User with email ${normalizedEmail} already registered`, 409)

        const otp = generateOTP(6)

        try {
            const payload: UserModel = {
                name: dto.name,
                email: normalizedEmail,
                role: "CONSUMER",
                passwordHash: await hashPassword(dto.password),
                avatarUrl: null,
            }

            const result = await prisma.$transaction(async(tx) => {
                const dateNow = Date.now();
                const createdAt = new Date(dateNow);
                const expiredAt = new Date(dateNow + 5 * 60 * 1000);
                await this.otpRepository.upsertOTP(
                    tx,
                    {
                        otpType: "REGISTER",
                        email: payload.email,
                        otpHash: await hashPassword(otp),
                        createdAt,
                        expiredAt,
                    }
                )

                const userCreate = this.userRepository.createUser(tx, payload);
                return userCreate;
            })
            await sendRegistrationOtpEmail({ to: result.email || normalizedEmail, otp })

            return result
            
            
        } catch (error) {
            throw error;
        }

    }

    async requestOtp(email: string) {
        const normalizedEmail = email.trim().toLowerCase();

        const user = await this.userRepository.getUserByEmail(prisma, normalizedEmail);

        if (!user) throw new AppError(`User with email ${normalizedEmail} is not registered`, 404);

        if (user.emailVerifiedAt) throw new AppError("This email address is already verified", 409);

        const otp = generateOTP(6);
        const now = new Date();
        const expiredAt = new Date(now.getTime() + 5 * 60 * 1000);

        const otpHash = await hashPassword(otp);

        await this.otpRepository.upsertOTP(prisma, {
            otpType: "REGISTER",
            email: normalizedEmail,
            otpHash,
            createdAt: now,
            expiredAt,
        });

        await sendRegistrationOtpEmail({
            to: normalizedEmail,
            otp,
        });

        return true;
    }

    async verifyOtp(dto: RequestOTPVerifyDTO) {
        const normalizedEmail = dto.email.trim().toLowerCase();
        const inputOtp = dto.otp.trim();

        const user = await this.userRepository.getUserByEmail(prisma, normalizedEmail);

        if (!user) throw new AppError(`User with email ${normalizedEmail} is not registered`, 404);

        if (user.emailVerifiedAt) throw new AppError("This email address is already verified", 409);

        const otpCheck = await this.otpRepository.getOtp(
            prisma,
            normalizedEmail,
            "REGISTER"
        );

        if (!otpCheck) throw new AppError("OTP is invalid or has already been used", 400);

        const now = new Date();

        if (now > otpCheck.expiredAt) {
            throw new AppError("OTP has expired, please request a new OTP", 400);
        }

        const isValidOtp = await comparePassword(
            inputOtp,
            otpCheck.otpHash
        );

        if (!isValidOtp) throw new AppError("Invalid OTP, please enter the correct OTP", 400);

        return await prisma.$transaction(async (tx) => {
            await this.otpRepository.deleteOtp(
                tx,
                normalizedEmail,
                "REGISTER"
            );

            const patchUser = await this.userRepository.patchUser(
                tx,
                user.id || "",
                {
                    emailVerifiedAt: new Date(),
                    status: "ACTIVE",
                }
            );

            return patchUser;
        });
    }

    async login (dto: RequestLoginDTO) {
        const normalizedEmail = dto.email.trim().toLowerCase();

        const user = await this.userRepository.getUserByEmail(prisma, normalizedEmail);
        if (!user) throw new AppError(`User with email ${normalizedEmail} is not registered`, 404);

        const isPasswordValid = await comparePassword(
            dto.password,
            user.passwordHash || ""
        );
        if (!isPasswordValid) throw new AppError("Your credentials is not valid", 400);
        
        if (!user.emailVerifiedAt) {
            await this.requestOtp(dto.email)
            throw new AppError("This email address is not verified. A new OTP has been sent to your email.", 409);
        }

        if (user.status !== "ACTIVE") throw new AppError("Your account is not active, please contact customer service", 403)

        try {
            const token = await generateAuthTokens({
                userId: user.id || "",
                role: user.role || "CONSUMER"
            })

            return {
                ...token,
                user: {
                    email: user.email,
                    role: user.role
                }
            }
        } catch (error) {
            throw error;
        }

    }

    async refresh(refreshToken: string) {
        const checkRefreshToken = verifyRefreshToken(refreshToken);
        if(!checkRefreshToken) throw new AppError("Refresh token is not valid", 401);

        const user = await this.userRepository.getUserById(prisma, checkRefreshToken.userId);
        if (!user) throw new AppError("User account could not be found.", 404);

        if (user.status !== "ACTIVE") throw new AppError("Your account is not active.", 403);

        try {
            const token = await generateAuthTokens({
                userId: user.id || "",
                role: user.role || "CONSUMER"
            })

            return {
                ...token,
                user: {
                    email: user.email,
                    role: user.role
                }
            }
        } catch (error) {
            throw error;
        }
    }

    async me(userId: string) {
        const user = await this.userRepository.getUserById(prisma, userId);
        if (!user) throw new AppError("User account could not be found.", 404);
        if (user.status !== "ACTIVE") throw new AppError("Your account is not active.", 403);

        return user;
    }


    async forgotPasswordOtp(email: string) {
        const normalizedEmail = email.trim().toLowerCase();

        const user = await this.userRepository.getUserByEmail(prisma, normalizedEmail);
        if (!user) throw new AppError(`User with email ${normalizedEmail} is not registered`, 404);
        if (!user.emailVerifiedAt) throw new AppError("This email address is not verified. A new OTP has been sent to your email.", 409);
        if (user.status !== "ACTIVE") throw new AppError("Your account is not active, please contact customer service", 403)


        const otp = generateOTP(6);
        const now = new Date();
        const expiredAt = new Date(now.getTime() + 15 * 60 * 1000);

        const otpHash = await hashPassword(otp);

        await this.otpRepository.upsertOTP(prisma, {
            otpType: "FORGOT_PASSWORD",
            email: normalizedEmail,
            otpHash,
            createdAt: now,
            expiredAt,
        });

        await sendRegistrationOtpEmail({
            to: normalizedEmail,
            otp,
        });

        return true;
    }
    async verifyForgotPasswordOtp(dto: RequestOTPVerifyDTO) {
        const normalizedEmail = dto.email.trim().toLowerCase();
        const inputOtp = dto.otp.trim();

        const user = await this.userRepository.getUserByEmail(prisma, normalizedEmail);
        if (!user) throw new AppError(`User with email ${normalizedEmail} is not registered`, 404);
        if (!user.emailVerifiedAt) throw new AppError("This email address is not verified. A new OTP has been sent to your email.", 409);
        if (user.status !== "ACTIVE") throw new AppError("Your account is not active, please contact customer service", 403)

        const otpCheck = await this.otpRepository.getOtp(
            prisma,
            normalizedEmail,
            "FORGOT_PASSWORD"
        );

        if (!otpCheck) throw new AppError("OTP is invalid or has already been used", 400);

        const now = new Date();

        if (now > otpCheck.expiredAt) {
            throw new AppError("OTP has expired, please request a new OTP", 400);
        }

        const isValidOtp = await comparePassword(
            inputOtp,
            otpCheck.otpHash
        );

        if (!isValidOtp) throw new AppError("Invalid OTP, please enter the correct OTP", 400);

        return true
    }
    async resetPasswordOtp(dto: RequestResetDTO) {
        const normalizedEmail = dto.email.trim().toLowerCase();
        const inputOtp = dto.otp.trim();

        const user = await this.userRepository.getUserByEmail(prisma, normalizedEmail);
        if (!user) throw new AppError(`User with email ${normalizedEmail} is not registered`, 404);
        if (!user.emailVerifiedAt) throw new AppError("This email address is not verified. A new OTP has been sent to your email.", 409);
        if (user.status !== "ACTIVE") throw new AppError("Your account is not active, please contact customer service", 403)

        const otpCheck = await this.otpRepository.getOtp(
            prisma,
            normalizedEmail,
            "FORGOT_PASSWORD"
        );

        if (!otpCheck) throw new AppError("OTP is invalid or has already been used", 400);

        const now = new Date();

        if (now > otpCheck.expiredAt) {
            throw new AppError("OTP has expired, please request a new OTP", 400);
        }

        const isValidOtp = await comparePassword(
            inputOtp,
            otpCheck.otpHash
        );

        if (!isValidOtp) throw new AppError("Invalid OTP, please enter the correct OTP", 400);

        return await prisma.$transaction(async (tx) => {
            await this.otpRepository.deleteOtp(
                tx,
                normalizedEmail,
                "FORGOT_PASSWORD"
            );

            const patchUser = await this.userRepository.patchUser(
                tx,
                user.id || "",
                {
                    passwordHash: await hashPassword(dto.password),
                    status: "ACTIVE",
                }
            );

            return patchUser;
        });
    }
}