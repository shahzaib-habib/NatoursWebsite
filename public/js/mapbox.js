export const displayMap = (locations) => {
    mapboxgl.accessToken = 'pk.eyJ1Ijoic2hhaHphaWJoYWJpYiIsImEiOiJja2NuMTBhNDkwNnIzMnJsdTdvb2QwZWo3In0.ylgTJr8kqRiE8PssDXewjQ';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/shahzaibhabib/ckcn174hn266g1ipfl74nlcfc',
        scrollZoom: false
        // center: [-118.113491, 34.111745],
        // zoom: 10,
        // interactive: false

    });

    // bounds object is basically the area to be displayed on the map
    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach(loc => {
        // Create marker
        const el = document.createElement('div');
        el.className = 'marker';

        // Add marker
        new mapboxgl.Marker({
            element: el,
            // so the bottom of the pin (image) which is going to be located at the exact gps
            anchor: 'bottom'
        }).setLngLat(loc.coordinates).addTo(map);

        // Add popup
        new mapboxgl.Popup({
            offset: 30
        }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo(map);

        // Extends map bounds to include current location
        bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }
    });
}