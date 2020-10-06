var map = L.map("map");

var tangramLayer = Tangram.leafletLayer({
  scene: "scene-alt.yaml",
  attribution:
    '<a href="https://mapzen.com/tangram" target="_blank">Tangram</a> | &copy; OSM contributors',
});

tangramLayer.addTo(map);

map.setView([37.3839, 126.6439], 16);
