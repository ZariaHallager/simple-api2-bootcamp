const locationElement = document.getElementById('location');
const bikeNetworksElement = document.getElementById('bike-networks');

// Function to get the user's public IP address using Ipify
async function getPublicIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        const ip = data.ip;
        console.log('Public IP:', ip); // Optional: Log IP for debugging
        getLocation(ip); // Pass the IP to get location data
    } catch (error) {
        console.error('Error fetching IP:', error);
        locationElement.textContent = 'Error fetching IP address.';
    }
}

// Function to fetch location data based on the IP address
async function getLocation(ip) {
    const ipApiUrl = `https://ipapi.co/${ip}/json/`; // Fetch location using ipapi

    try {
        const response = await fetch(ipApiUrl);
        const data = await response.json();

        if (data.latitude && data.longitude) {
            const { latitude, longitude, city, region, country_name } = data;
            locationElement.textContent = `Location: ${city}, ${region}, ${country_name}`;
            getBikeNetworks(latitude, longitude); // Fetch bike networks
        } else {
            locationElement.textContent = 'Unable to fetch location data.';
        }
    } catch (error) {
        console.error('Error fetching location:', error);
        locationElement.textContent = 'Error fetching location data.';
    }
}

// Function to fetch bike networks based on location
async function getBikeNetworks(latitude, longitude) {
    const bikeApiUrl = 'http://api.citybik.es/v2/networks';

    try {
        const response = await fetch(bikeApiUrl);
        const data = await response.json();

        const nearbyNetworks = data.networks.filter(network => {
            return network.location.latitude && network.location.longitude &&
                isWithinRadius(latitude, longitude, network.location.latitude, network.location.longitude, 50); // 50 km radius
        });

        if (nearbyNetworks.length > 0) {
            bikeNetworksElement.innerHTML = '<h2>Nearby City Bike Networks:</h2>' +
                nearbyNetworks.map(network => `
                    <div>
                        <p><strong>${network.name}</strong></p>
                        <p>Location: ${network.location.city}, ${network.location.country}</p>
                        <p>Latitude: ${network.location.latitude}, Longitude: ${network.location.longitude}</p>
                    </div>
                `).join('');
        } else {
            bikeNetworksElement.innerHTML = 'No nearby city bike networks found.';
        }
    } catch (error) {
        console.error('Error fetching bike networks:', error);
        bikeNetworksElement.innerHTML = 'Error fetching bike networks data.';
    }
}

// Function to calculate if two points are within a specified radius (in km)
function isWithinRadius(lat1, lon1, lat2, lon2, radius) {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Radius of the Earth in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance <= radius; // Check if within radius
}

// Call getPublicIP when the page loads
window.onload = () => {
    getPublicIP();
};
