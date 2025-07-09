
'use server';

/**
 * Sends an SMS to a given phone number using the bulksmsbd.net API.
 * Logging is handled on the client-side after this action completes.
 */
export async function sendSms(phoneNumber: string, message: string): Promise<{ success: boolean; message: string }> {
    const apiKey = 'LkcuBmpXSgO77LgytC9w';
    const senderId = '8809617614208';
    const apiUrl = 'http://bulksmsbd.net/api/smsapi';

    let result: { success: boolean; message: string };

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

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}: ${responseText}`);
        }
        
        // Assuming any 2xx response is a success and the text response is the message.
        // We will pass this text directly to the toast notification.
        result = { success: true, message: `SMS Status: ${responseText}` };

    } catch (error: any) {
        console.error('Failed to send SMS:', error);
        const errorMessage = (error instanceof Error) ? error.message : 'An unknown error occurred.';
        result = { success: false, message: `SMS sending failed: ${errorMessage}` };
    }
    
    return result;
}
