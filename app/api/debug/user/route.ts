// // app/api/debug/user/route.ts
// import prisma from "@/lib/prisma";
// import { NextResponse } from "next/server";

// export async function GET() {
//   const users = await prisma.user.findMany({
//     select: {
//       id: true,
//       email: true,
//       password: true,
//     },
//     take: 3,
//   });

//   return NextResponse.json({
//     users: users.map((u) => ({
//       email: u.email,
//       hasPassword: !!u.password,
//       passwordFormat: u.password
//         ? u.password.startsWith("$2")
//           ? "✅ Bcrypt hashed"
//           : "❌ NOT hashed properly"
//         : "❌ No password",
//       passwordPreview: u.password?.substring(0, 15) + "...",
//     })),
//   });
// }
