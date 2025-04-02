import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { Any } from "@/type/common";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "src/data/copyrights.json");
    const data = await fs.readFile(filePath, "utf8");
    const { copyrights } = JSON.parse(data);
    return NextResponse.json(copyrights);
  } catch (error) {
    console.error("Error reading copyrights:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const copyright = await request.json();
    const filePath = path.join(process.cwd(), "src/data/copyrights.json");
    const data = await fs.readFile(filePath, "utf8");
    const { copyrights } = JSON.parse(data);

    const newCopyright = {
      ...copyright,
      id: String(Date.now()),
      created_at: new Date().toISOString(),
    };

    copyrights.push(newCopyright);
    await fs.writeFile(filePath, JSON.stringify({ copyrights }, null, 2));
    return NextResponse.json(newCopyright);
  } catch (error) {
    console.error("Error creating copyright:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updateData } = await request.json();
    const filePath = path.join(process.cwd(), "src/data/copyrights.json");
    const data = await fs.readFile(filePath, "utf8");
    const { copyrights } = JSON.parse(data);

    const index = copyrights.findIndex((c: Any) => c.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: "Copyright not found" },
        { status: 404 }
      );
    }

    copyrights[index] = {
      ...copyrights[index],
      ...updateData,
    };

    await fs.writeFile(filePath, JSON.stringify({ copyrights }, null, 2));
    return NextResponse.json(copyrights[index]);
  } catch (error) {
    console.error("Error updating copyright:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const filePath = path.join(process.cwd(), "src/data/copyrights.json");
    const data = await fs.readFile(filePath, "utf8");
    const { copyrights } = JSON.parse(data);

    const index = copyrights.findIndex((c: Any) => c.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: "Copyright not found" },
        { status: 404 }
      );
    }

    copyrights.splice(index, 1);
    await fs.writeFile(filePath, JSON.stringify({ copyrights }, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting copyright:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
