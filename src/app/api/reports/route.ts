import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { Any } from "@/type/common";

const FB_ACCESS_TOKEN =
  "EAAX9oJLBHNABOwhZBzaEJJLVd1pBu4ry9qL9k7lsVh5BWEbhV3oDJe8W2oQKB3WDRWesC5AqsHeBKqwf8gHSQKoeioZA1fnDEfZCGXl1QGjUWZBK0vmMyWs5CDR9Nu5N6TohQ2PzJ94a4rXPm73z62Ttox2QZAyJsChG3ZA8cVbSyDQ2m5unf3JZCICaFhxvxkKAPN7l9bZAc1rDYYyiKFwMOnAsgoDYTU1t0T2Q8NgJ";

const REPORT_TYPES = {
  Copyright: [
    "job",
    "email",
    "name",
    "organization",
    "relationship",
    "relationship_other",
    "owner_name",
    "owner_country",
    "address",
    "original_type",
    "original_urls",
    "content_urls",
  ],
  Trademark: [
    "job",
    "email",
    "name",
    "organization",
    "relationship",
    "relationship_other",
    "owner_name",
    "owner_country",
    "address",
    "phone",
    "tm",
    "tm_jurisdiction",
    "tm_reg_number",
    "tm_url",
    "original_type",
    "content_urls",
  ],
  Counterfeit: [
    "job",
    "email",
    "name",
    "organization",
    "relationship",
    "relationship_other",
    "owner_name",
    "owner_country",
    "address",
    "phone",
    "tm",
    "tm_jurisdiction",
    "tm_reg_number",
    "tm_url",
    "original_type",
    "content_urls",
  ],
  Retraction: ["original_report_id", "content_urls", "retraction_reason"],
};

async function sendFacebookReport(reportData: Any) {
  const response = await fetch(
    "https://graph.facebook.com/v12.0/ip_reporting?fields=report_id,report_type",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        ...reportData,
        access_token: FB_ACCESS_TOKEN,
      }),
    }
  );

  const responseData = await response.json();
  if (!response.ok) {
    console.log(responseData);
    throw new Error(JSON.stringify(responseData));
  }

  return responseData;
}

export async function POST(request: NextRequest) {
  try {
    const reportData = await request.json();
    const { type } = reportData;

    // Validate report type
    if (!REPORT_TYPES[type as keyof typeof REPORT_TYPES]) {
      return NextResponse.json(
        { error: "Invalid report type" },
        { status: 400 }
      );
    }

    let fbResponse;
    let status = "success";
    let error_message = "";

    try {
      // Send report to Facebook
      fbResponse = await sendFacebookReport({
        ...reportData,
        type: type.toUpperCase(),
      });
    } catch (error) {
      status = "failed";
      error_message = error instanceof Error ? error.message : String(error);
      console.error("Facebook API error:", error);
    }

    // Read existing reports
    const reportsFilePath = path.join(process.cwd(), "src/data/reports.json");
    const reportsData = await fs.readFile(reportsFilePath, "utf8");
    const { reports } = JSON.parse(reportsData);

    // Add new report with timestamp and status
    const newReport = {
      ...reportData,
      fb_response: fbResponse,
      status,
      error_message,
      created_at: new Date().toISOString(),
    };

    reports.push(newReport);

    // Write updated reports back to file
    await fs.writeFile(reportsFilePath, JSON.stringify({ reports }, null, 2));

    if (status === "failed") {
      return NextResponse.json(
        { error: "Facebook API error", details: error_message },
        { status: 500 }
      );
    }

    return NextResponse.json(newReport);
  } catch (error) {
    console.error("Report submission error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Read reports from JSON file
    const reportsFilePath = path.join(process.cwd(), "src/data/reports.json");
    const reportsData = await fs.readFile(reportsFilePath, "utf8");
    const { reports } = JSON.parse(reportsData);

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Get reports error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Report ID is required" },
        { status: 400 }
      );
    }

    // Read existing reports
    const reportsFilePath = path.join(process.cwd(), "src/data/reports.json");
    const reportsData = await fs.readFile(reportsFilePath, "utf8");
    const { reports } = JSON.parse(reportsData);

    // Convert id to number and check if it's valid
    const index = parseInt(id);
    if (isNaN(index) || index < 0 || index >= reports.length) {
      return NextResponse.json(
        { error: "Invalid report index" },
        { status: 400 }
      );
    }

    // Remove the report at the specified index
    reports.splice(index, 1);

    // Write updated reports back to file
    await fs.writeFile(reportsFilePath, JSON.stringify({ reports }, null, 2));

    return NextResponse.json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error) {
    console.error("Delete report error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
