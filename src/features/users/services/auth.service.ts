import { sendRegistrationOtpEmail } from "../../../libs/email";
import { prisma } from "../../../libs/prisma";
import { AppError } from "../../../utils/AppError";
import { hashPassword } from "../../../utils/bcrypt";
import { generateOTP } from "../../../utils/otp";
import { RequestRegisterDTO } from "../dto/auth.dto";
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
        const regEmailCheck = await this.userRepository.getUserByEmail(prisma, dto.email);
        if(regEmailCheck) throw new AppError(`User with email ${dto.email} already registered`, 409)

        const otp = generateOTP(6)

        try {
            const payload: UserModel = {
                name: dto.name,
                email: dto.email,
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
            await sendRegistrationOtpEmail({ to: result.email || dto.email, otp })

            return result
            
            
        } catch (error) {
            throw error;
        }

    }
}