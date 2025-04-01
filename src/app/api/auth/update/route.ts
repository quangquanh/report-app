import { NextRequest, NextResponse } from "next/server";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { promises as fs } from "fs";
import path from "path";
import { Any } from "@/type/common";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to verify JWT token
const verifyToken = async (request: NextRequest) => {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return { error: "No token provided", status: 401 };
    }

    const decoded = jwt.verify(token, JWT_SECRET) as Any;
    return { userId: decoded.userId };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { error: "Invalid token", status: 401 };
  }
};

export async function PUT(request: NextRequest) {
  try {
    // Verify token
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { userId } = authResult;
    const { name, email, currentPassword, newPassword } = await request.json();

    // Read users from JSON file
    const usersFilePath = path.join(process.cwd(), "src/data/users.json");
    const usersData = await fs.readFile(usersFilePath, "utf8");
    const { users } = JSON.parse(usersData);

    // Find user by ID
    const userIndex = users.findIndex((u: Any) => u.id === userId);
    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = users[userIndex];

    // Verify current password if new password is provided
    if (newPassword) {
      const isValidPassword = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 401 }
        );
      }
    }

    // Update user information
    const updatedUser = {
      ...user,
      name: name || user.name,
      email: email || user.email,
      password: newPassword
        ? await bcrypt.hash(newPassword, 10)
        : user.password,
      updated_at: new Date().toISOString(),
    };

    users[userIndex] = updatedUser;

    // Write updated users back to file
    await fs.writeFile(usersFilePath, JSON.stringify({ users }, null, 2));

    // Return updated user info without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = updatedUser;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
