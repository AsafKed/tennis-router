export async function dispatchTrackingData(data) {
    // Add current date and time to data
    data['timestamp'] = new Date().toISOString();
    
    // Assign UID here to avoid boiler plate everywhere else
    if (localStorage.getItem('userId')) {
        data['user_id'] = localStorage.getItem('userId').replace(/"/g, "");
    } else if (localStorage.getItem('userPreLoginId')) {
        data['guest_id'] = localStorage.getItem('userPreLoginId');
    }

    console.log(data);

    // Introduce a delay before making the fetch call to prevent guest node duplicates
    await new Promise(resolve => setTimeout(resolve, 1000));

    fetch('/users/track', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.log(error))
}
