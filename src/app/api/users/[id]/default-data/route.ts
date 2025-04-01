import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { Any } from "@/type/common";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }
    const userId = id;
    const usersFilePath = path.join(process.cwd(), "src/data/users.json");
    const usersData = await fs.readFile(usersFilePath, "utf8");
    const { users } = JSON.parse(usersData);

    const user = users.find((user: Any) => user.id === Number(userId));
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ default_data: user.default_data });
  } catch (error) {
    console.error("Get user default data error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!params?.id) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }
    const userId = params.id;
    const { default_data } = await request.json();

    const usersFilePath = path.join(process.cwd(), "src/data/users.json");
    const usersData = await fs.readFile(usersFilePath, "utf8");
    const { users } = JSON.parse(usersData);

    const userIndex = users.findIndex(
      (user: Any) => user.id === Number(userId)
    );
    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    users[userIndex].default_data = default_data;
    users[userIndex].updated_at = new Date().toISOString();

    await fs.writeFile(usersFilePath, JSON.stringify({ users }, null, 2));

    return NextResponse.json({ default_data });
  } catch (error) {
    console.error("Update user default data error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
