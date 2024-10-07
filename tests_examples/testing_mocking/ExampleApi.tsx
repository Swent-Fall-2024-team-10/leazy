export async function getUserProfile() {
    const response = await fetch('https://api.example.com/user-profile');
    
    return await response.json();
}
