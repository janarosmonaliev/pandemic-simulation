const canvas = document.getElementById("map");
const map = new harp.MapView({
  canvas,
  theme:
    "https://unpkg.com/@here/harp-map-theme@latest/resources/berlin_tilezen_night_reduced.json",
  //For tile cache optimization:
  maxVisibleDataSourceTiles: 100,
  tileCacheSize: 200,
});

map.setCameraGeolocationAndZoom(
  new harp.GeoCoordinates(1.278676, 103.850216),
  16
);

const mapControls = new harp.MapControls(map);
const ui = new harp.MapControlsUI(mapControls);
canvas.parentElement.appendChild(ui.domElement);

mapControls.maxPitchAngle = 90;
// mapControls.setRotation(6.3, 50);

map.resize(window.innerWidth, window.innerHeight);
window.onresize = () => map.resize(window.innerWidth, window.innerHeight);

const omvDataSource = new harp.OmvDataSource({
  baseUrl: "https://xyz.api.here.com/tiles/herebase.02",
  apiFormat: harp.APIFormat.XYZOMV,
  styleSetName: "tilezen",
  authenticationCode: "AJ2-vU60Q_6dpaTrEQjOHgA",
});
map.addDataSource(omvDataSource);
// J0IJdYzKDYS3nHVDDEWETIqK3nAcxqW42vz7xeSq61M
// AJ2-vU60Q_6dpaTrEQjOHgA
