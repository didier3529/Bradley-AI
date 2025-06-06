import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Mock response for development - no authentication or database
    const mockSettings = {
      twoFactorEnabled: body.twoFactorEnabled || false,
      sessionTimeout: body.sessionTimeout || 30,
      ipWhitelist: body.ipWhitelist || [],
      apiKeyRotation: body.apiKeyRotation || false,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(mockSettings)
  } catch (error) {
    console.error("[SECURITY_UPDATE]", error)
    return NextResponse.json(
      { error: "Failed to update security settings" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Mock response for development
    const mockSettings = {
      twoFactorEnabled: false,
      sessionTimeout: 30,
      ipWhitelist: [],
      apiKeyRotation: false,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(mockSettings)
  } catch (error) {
    console.error("[SECURITY_GET]", error)
    return NextResponse.json(
      { error: "Failed to fetch security settings" },
      { status: 500 }
    )
  }
} 