export function dispatchTrackingData(data) {
    // Add current date and time to data
    data['timestamp'] = new Date().toISOString();
    
    // Assign UID here to avoid boiler plate everywhere else
    if (localStorage.getItem('userId')) {
        data['user_id'] = localStorage.getItem('userId');
    } else if (localStorage.getItem('userPreLoginId')) {
        data['user_pre_login_id'] = localStorage.getItem('userPreLoginId');
    }

    console.log(data);

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