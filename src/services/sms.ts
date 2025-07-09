
'use server';

/**
 * Sends an OTP to a given phone number using a third-party API.
 * NOTE: This is a simulated function by default. To make it work, you need to:
 * 1. Replace the placeholder URL with your actual OTP provider's API endpoint.
 * 2. Configure the request body and headers as required by your provider.
 * 3. Add your API key to an environment variable (.env.local), e.g., OTP_API_KEY.
 * 4. Uncomment the fetch logic below.
 */
export async function sendOtp(phoneNumber: string, otp: string): Promise<{ success: boolean; message: string }> {
    const apiKey = process.env.OTP_API_KEY;
    const apiUrl = 'https://api.yourotpprovider.com/send'; // <-- IMPORTANT: REPLACE THIS URL

    console.log(`--- SIMULATING OTP SMS (to enable, edit src/services/sms.ts) ---`);
    console.log(`Phone Number: ${phoneNumber}`);
    console.log(`OTP: ${otp}`);
    console.log(`------------------------------------------------------------------`);

    // In a real application, you would uncomment and use the following code:
    /*
    if (!apiKey || apiUrl === 'https://api.yourotpprovider.com/send') {
        console.error('OTP API configuration is incomplete. SMS not sent.');
        return { success: false, message: 'OTP API configuration is missing on the server.' };
    }

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}` // Or however your API authenticates
            },
            body: JSON.stringify({
                to: phoneNumber,
                message: `Your verification code is: ${otp}`
                // ... add other parameters required by your API
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'API request failed');
        }
        
        return { success: true, message: 'OTP has been sent to the client.' };

    } catch (error) {
        console.error('Failed to send OTP:', error);
        return { success: false, message: 'Failed to send OTP via API.' };
    }
    */

    return { success: true, message: `An OTP has been sent to ${phoneNumber} (Simulated).` };
}
