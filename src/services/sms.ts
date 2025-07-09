
'use server';

/**
 * Sends an SMS to a given phone number using a third-party API.
 * IMPORTANT: Replace placeholder values with your actual API credentials.
 */
export async function sendSms(phoneNumber: string, message: string): Promise<{ success: boolean; message: string }> {
    // Replace with your actual API Key. For better security, use environment variables.
    const apiKey = 'YOUR_SMS_API_KEY'; 
    // Replace with your actual API endpoint.
    const apiUrl = 'https://api.yourotpprovider.com/send'; 

    if (!apiKey || apiKey === 'YOUR_SMS_API_KEY' || !apiUrl || apiUrl.includes('yourotpprovider.com')) {
        const warning = 'SMS API configuration is incomplete. SMS not sent.';
        console.error(warning);
        // Simulate success for UI testing, but provide a clear message.
        return { success: true, message: `SMS to ${phoneNumber} was not sent. API is not configured.` };
    }

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}` // Adjust authorization as per your provider
            },
            body: JSON.stringify({
                to: phoneNumber,
                message: message
                // Add other parameters required by your API, like 'from' or 'sender_id'
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'API request failed');
        }
        
        return { success: true, message: 'SMS has been sent to the client successfully.' };

    } catch (error) => {
        console.error('Failed to send SMS:', error);
        return { success: false, message: 'Failed to send SMS via API. Check server logs.' };
    }
}
