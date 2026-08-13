import { Role } from "../../../generated/prisma/enums";

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;

    captchaToken: string;
    captchaAnswer: string;
}

export interface RegisterResponse {
    id: string;
    name: string;
    email: string;
    role: Role;
}