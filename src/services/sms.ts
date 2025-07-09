
'use server';

/**
 * Sends an SMS to a given phone number using the bulksmsbd.net API.
 * Logging is handled on the client-side after this action completes.
 */
export async function sendSms(phoneNumber: string, message: string): Promise<{ success: boolean; message: string }> {
    const apiKey = 'LkcuBmpXSgO77LgytC9w';
    const senderId = '8809617614208';
    const apiUrl = 'http://bulksmsbd.net/api/smsapi';

    try {
        const urlWithParams = new URL(apiUrl);
        urlWithParams.searchParams.append('api_key', apiKey);
        urlWithParams.searchParams.append('type', 'text');
        urlWithParams.searchParams.append('number', phoneNumber);
        urlWithParams.searchParams.append('senderid', senderId);
        urlWithParams.searchParams.append('message', message);

        const response = await fetch(urlWithParams.toString(), {
            method: 'GET',
        });

        const responseText = await response.text();

        // The API might return 200 OK even for errors, so we must parse the body.
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}: ${responseText}`);
        }
        
        try {
            const data = JSON.parse(responseText);
            // According to bulksmsbd API, a response code of 202 means success.
            if (data.response_code === 202) {
                return { success: true, message: data.success_message || 'SMS submitted successfully.' };
            } else {
                // Any other code is an error.
                return { success: false, message: data.error_message || `API Error: Code ${data.response_code}` };
            }
        } catch (e) {
            // Handle cases where the response is not valid JSON
            console.error('Could not parse SMS API response:', responseText, e);
            throw new Error('Received an unreadable response from the SMS provider.');
        }

    } catch (error: any) {
        console.error('Failed to send SMS:', error);
        const errorMessage = (error instanceof Error) ? error.message : 'An unknown error occurred.';
        return { success: false, message: `SMS sending failed: ${errorMessage}` };
    }
}
