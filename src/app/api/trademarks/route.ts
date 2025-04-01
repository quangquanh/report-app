import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { Any } from "@/type/common";

// Get all trademarks
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "src/data/trademarks.json");
    const data = await fs.readFile(filePath, "utf8");
    const { trademarks } = JSON.parse(data);
    return NextResponse.json(trademarks);
  } catch (error) {
    console.error("Error reading trademarks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Create new trademark
export async function POST(request: NextRequest) {
  try {
    const trademark = await request.json();
    const filePath = path.join(process.cwd(), "src/data/trademarks.json");
    const data = await fs.readFile(filePath, "utf8");
    const { trademarks } = JSON.parse(data);

    // Generate new ID
    const newId = String(
      Math.max(...trademarks.map((t: Any) => Number(t.id)), 0) + 1
    );

    const newTrademark = {
      id: newId,
      ...trademark,
      created_at: new Date().toISOString(),
    };

    trademarks.push(newTrademark);
    await fs.writeFile(filePath, JSON.stringify({ trademarks }, null, 2));

    return NextResponse.json(newTrademark);
  } catch (error) {
    console.error("Error creating trademark:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Update trademark
export async function PUT(request: NextRequest) {
  try {
    const { id, ...updateData } = await request.json();
    const filePath = path.join(process.cwd(), "src/data/trademarks.json");
    const data = await fs.readFile(filePath, "utf8");
    const { trademarks } = JSON.parse(data);

    const index = trademarks.findIndex((t: Any) => t.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: "Trademark not found" },
        { status: 404 }
      );
    }

    trademarks[index] = {
      ...trademarks[index],
      ...updateData,
    };

    await fs.writeFile(filePath, JSON.stringify({ trademarks }, null, 2));
    return NextResponse.json(trademarks[index]);
  } catch (error) {
    console.error("Error updating trademark:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete trademark
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const filePath = path.join(process.cwd(), "src/data/trademarks.json");
    const data = await fs.readFile(filePath, "utf8");
    const { trademarks } = JSON.parse(data);

    const index = trademarks.findIndex((t: Any) => t.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: "Trademark not found" },
        { status: 404 }
      );
    }

    trademarks.splice(index, 1);
    await fs.writeFile(filePath, JSON.stringify({ trademarks }, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting trademark:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
