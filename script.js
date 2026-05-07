// Function to calculate carbon footprint and animate the tree
function calculateFootprint() {
    const distanceInput = document.getElementById('distance').value.trim();
    const result = document.getElementById('result');
    const leaves = document.querySelectorAll('.leaf');

    // Reset all leaves before validating so a bad follow-up entry never leaves
    // the previous footprint animation on screen.
    leaves.forEach(leaf => {
        leaf.classList.remove('falling');
    });

    // parseFloat accepts partial values such as "12abc"; the tracker should only
    // calculate from a complete, finite, non-negative kilometre value.
    const distance = Number(distanceInput);
    if (distanceInput === '' || !Number.isFinite(distance) || distance < 0) {
        result.textContent = 'Enter a valid non-negative distance in kilometres.';
        return;
    }

    const footprint = distance * 0.1;
    result.textContent = `Carbon Footprint: ${footprint.toFixed(2)} kg CO2`;

    // Determine number of falling leaves based on footprint
    let numFalling;
    if (footprint < 10) {
        numFalling = 0;        // Low impact: no leaves fall
    } else if (footprint < 50) {
        numFalling = 3;        // Medium impact: 3 leaves fall
    } else {
        numFalling = 6;        // High impact: 6 leaves fall
    }

    // Make the first numFalling leaves fall with random rotation
    for (let i = 0; i < numFalling && i < leaves.length; i++) {
        const rotation = Math.random() * 180 - 90; // Random rotation between -90 and 90 degrees
        leaves[i].style.setProperty('--rotation', `${rotation}deg`);
        leaves[i].classList.add('falling');
    }
}

// Fetch and display sustainability news
fetch('https://newsapi.org/v2/everything?q=sustainability%20OR%20environment%20OR%20%22climate%20change%22&language=en&pageSize=10&apiKey=f3d8d90a61af4757a0c86708315d463e')
  .then(response => response.json())
  .then(data => {
    const headlines = data.articles.map(article => article.title).join(' • ');
    document.querySelector('.news-content').textContent = headlines;
  })
  .catch(error => {
    document.querySelector('.news-content').textContent = 'Unable to fetch news.';
  });
