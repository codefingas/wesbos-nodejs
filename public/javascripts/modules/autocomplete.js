function autocomplete(input, latInput, lngInput) {
  if(!input) return; // Skip if there is no input (or address)
  const dropdown = new google.maps.places.Autocomplete(input);

  dropdown.addListener('place_changed', () => {
    const place = dropdown.getPlace();
    console.log(place);
    latInput.value = place.geometry.location.lat();
    lngInput.value = place.geometry.location.lng();
  });
  // if someome hits enter in the address field, do not submit the form
  input.on('keydown', (e) => {
    if(e.keyCode === 13) e.preventDefault();
  });
}

export default autocomplete;
