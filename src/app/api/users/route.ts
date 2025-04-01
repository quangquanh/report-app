import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import bcrypt from "bcrypt";
import { Any } from "@/type/common";

const SALT_ROUNDS = 10;

async function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function GET() {
  try {
    const usersFilePath = path.join(process.cwd(), "src/data/users.json");
    const usersData = await fs.readFile(usersFilePath, "utf8");
    const { users } = JSON.parse(usersData);

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();
    const { email, password, name, role } = userData;

    const usersFilePath = path.join(process.cwd(), "src/data/users.json");
    const usersData = await fs.readFile(usersFilePath, "utf8");
    const { users } = JSON.parse(usersData);

    if (users.some((user: Any) => user.email === email)) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const newUser = {
      id: users.length + 1,
      email,
      password: hashedPassword,
      name,
      role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    users.push(newUser);
    await fs.writeFile(usersFilePath, JSON.stringify({ users }, null, 2));

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = request.nextUrl.pathname.split("/").pop();
    const userData = await request.json();
    const { email, password, name, role } = userData;

    // Read existing users
    const usersFilePath = path.join(process.cwd(), "src/data/users.json");
    const usersData = await fs.readFile(usersFilePath, "utf8");
    const { users } = JSON.parse(usersData);

    // Find user index
    const userIndex = users.findIndex(
      (user: Any) => user.id === Number(userId)
    );
    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if email already exists (excluding current user)
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

    // Update user
    const updatedUser = {
      ...users[userIndex],
      email,
      name,
      role,
      updated_at: new Date().toISOString(),
    };

    // Update password if provided
    if (password) {
      updatedUser.password = await hashPassword(password);
    }

    users[userIndex] = updatedUser;

    // Write updated users back to file
    await fs.writeFile(usersFilePath, JSON.stringify({ users }, null, 2));

    // Remove password from response
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

export async function DELETE(request: NextRequest) {
  try {
    const userId = request.nextUrl.pathname.split("/").pop();

    // Read existing users
    const usersFilePath = path.join(process.cwd(), "src/data/users.json");
    const usersData = await fs.readFile(usersFilePath, "utf8");
    const { users } = JSON.parse(usersData);

    // Find user index
    const userIndex = users.findIndex(
      (user: Any) => user.id === Number(userId)
    );
    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Remove user
    users.splice(userIndex, 1);

    // Write updated users back to file
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
