
'use server';

/**
 * Sends an SMS to a given phone number using the Teletalk Bulk SMS API.
 * Logging is handled on the client-side after this action completes.
 */
export async function sendSms(phoneNumber: string, message: string): Promise<{ success: boolean; message: string }> {
    const apiKey = 'C20092286552277d73ad70.36384241';
    const apiUrl = 'http://bulksms.teletalk.com.bd/api/sendSms';

    let result: { success: boolean; message: string };

    try {
        // Construct the URL with query parameters
        const urlWithParams = new URL(apiUrl);
        urlWithParams.searchParams.append('apiKey', apiKey);
        urlWithParams.searchParams.append('message', message);
        urlWithParams.searchParams.append('mobileNumbers', phoneNumber);

        const response = await fetch(urlWithParams.toString(), {
            method: 'GET',
        });

        // Try to parse the response as JSON, regardless of status code.
        const responseData = await response.json();
        const apiResponseMessage = responseData?.message || responseData?.response_msg || 'No message from API.';

        if (!response.ok) {
            // The request failed (e.g., 4xx, 5xx status)
            throw new Error(apiResponseMessage);
        }
        
        // The request was successful (2xx status).
        // The response message from the API will be used in the toast notification.
        result = { success: true, message: apiResponseMessage };

    } catch (error: any) {
        console.error('Failed to send SMS:', error);
        // Ensure the message is a string for the error toast
        const errorMessage = (error instanceof Error) ? error.message : String(error);
        result = { success: false, message: `SMS sending failed: ${errorMessage}` };
    }
    
    return result;
}
