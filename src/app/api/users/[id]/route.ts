import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import bcrypt from "bcrypt";
import { Any } from "@/type/common";

const SALT_ROUNDS = 10;

async function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const userData = await request.json();
    const { email, password, name, role } = userData;

    const usersFilePath = path.join(process.cwd(), "src/data/users.json");
    const usersData = await fs.readFile(usersFilePath, "utf8");
    const { users } = JSON.parse(usersData);

    const userIndex = users.findIndex(
      (user: Any) => user.id === Number(userId)
    );
    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (
      users.some(
        (user: Any) => user.email === email && user.id !== Number(userId)
      )
    ) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    const updatedUser = {
      ...users[userIndex],
      email,
      name,
      role,
      updated_at: new Date().toISOString(),
    };

    if (password) {
      updatedUser.password = await hashPassword(password);
    }

    users[userIndex] = updatedUser;
    await fs.writeFile(usersFilePath, JSON.stringify({ users }, null, 2));

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = updatedUser;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const usersFilePath = path.join(process.cwd(), "src/data/users.json");
    const usersData = await fs.readFile(usersFilePath, "utf8");
    const { users } = JSON.parse(usersData);

    const userIndex = users.findIndex(
      (user: Any) => user.id === Number(userId)
    );
    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    users.splice(userIndex, 1);
    await fs.writeFile(usersFilePath, JSON.stringify({ users }, null, 2));

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
