import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';

export async function GET(request: Request) {
    // Load ImageKit variables from environment
    const {
        NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
        IMAGEKIT_PRIVATE_KEY,
        NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
    } = process.env;

    // Check if variables are properly loaded
    if (!NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_PRIVATE_KEY || !NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT) {
        return NextResponse.json({
            success: false,
            message: "ImageKit credentials are not configured on the server."
        }, { status: 500 });
    }

    // Initialize ImageKit client
    const imagekit = new ImageKit({
        publicKey: NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
        privateKey: IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
    });

    try {
        // Generate authentication parameters
        const authenticationParameters = imagekit.getAuthenticationParameters();
        // Send the parameters as JSON to the frontend
        return NextResponse.json(authenticationParameters);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('ImageKit Auth Error:', message);
        return NextResponse.json({
            success: false,
            message: 'Failed to get authentication parameters.'
        }, { status: 500 });
    }
}
