import { Prisma } from "../generated/prisma/client";

interface ParsedPrismaError {
  statusCode: number;
  message: string;
}

export const parsePrismaError = (error: Prisma.PrismaClientKnownRequestError): ParsedPrismaError => {
  console.error(error)
  switch (error.code) {
    case "P2002": {
      const target = (error.meta?.target as string[])?.join(", ") || "field";
      return {
        statusCode: 409,
        message: `Data dengan ${target} tersebut sudah terdaftar.`,
      };
    }
    case "P2025":
      return {
        statusCode: 404,
        message: "Data yang diminta tidak ditemukan.",
      };
    case "P2003":
      return {
        statusCode: 400,
        message: "Gagal memproses data karena relasi antar data tidak valid.",
      };
    case "P2014":
      return {
        statusCode: 400,
        message: "Perubahan tidak dapat dilakukan karena terkait dengan data lain.",
      };
    default:
      return {
        statusCode: 400,
        message: `Terjadi kesalahan pada database (Code: ${error.code}).`,
      };
  }
};