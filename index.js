fetch('https://api.open-meteo.com/v1/forecast?latitude=40.71&longitude=-74.01&current_weather=true')
  .then(response => response.json())
  .then(data => {
    console.log(data); // Check the response in the console
  })
  .catch(error => {
    console.error('Error fetching weather:', error);
  });