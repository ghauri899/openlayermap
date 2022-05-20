import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { MVT } from "ol/format";
import OSM from "ol/source/OSM";
import portland from "./assets/GeoJson/portland.geojson";
import "ol/ol.css";
import marki from "./assets/Maps/marker4.png";
import {
  defaults,
  ScaleLine,
  Rotate,
  FullScreen,
  ZoomSlider,
  ZoomToExtent,
  MousePosition,
  OverviewMap,
} from "ol/control";
import {
  DragRotateAndZoom,
  defaults as defaultInteractions,
  Modify,
  Draw,
  Snap,
} from "ol/interaction";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { GeoJSON } from "ol/format";
import VectorTileLayer from "ol/layer/VectorTile";
import VectorTileSource from "ol/source/VectorTile";
import { Fragment } from "react/cjs/react.production.min";
import { Feature } from "ol";
import Point from "ol/geom/Point";
import { transform } from "ol/proj";
import { Circle, Fill, Icon, Stroke, Style } from "ol/style";

function App() {
  const key =
    "pk.eyJ1IjoidXNtYW4tZ2hhdXJpIiwiYSI6ImNsMzRnNm9lczE3MzMzZHBmejFwb3RtNHgifQ.x89dbT1H4iK7NQaKnkbxQw";
  const image = new Icon({
    anchor: [0.5, 1],
    imgSize: [32, 48],
    src: marki,
  });

  const [map, setMap] = useState();
  const [source, setSource] = useState(
    new VectorSource({
      //uncomment following line to include portland.json
      url: portland,
      //url: "https://openlayers.org/data/vector/ecoregions.json",
      format: new GeoJSON(),
    })
  );
  const mapElement = useRef();
  const mapRef = useRef();
  mapRef.current = map;
  let modify = Modify;
  let draw = Draw;
  let styles = {
    Point: new Style({
      image: image,
    }),
    LineString: new Style({
      stroke: new Stroke({
        color: "#ff0000",
        width: 3,
      }),
    }),
    MultiLineString: new Style({
      stroke: new Stroke({
        color: "#ff0000",
        width: 3,
      }),
    }),
    MultiPoint: new Style({
      image: image,
    }),
    MultiPolygon: new Style({
      stroke: new Stroke({
        color: "#ff0000",
        width: 3,
      }),
    }),
    Polygon: new Style({
      stroke: new Stroke({
        color: "#ff0000",
        width: 3,
      }),
    }),
    GeometryCollection: new Style({
      stroke: new Stroke({
        color: "magenta",
        width: 2,
      }),
      fill: new Fill({
        color: "magenta",
      }),
      image: new Circle({
        radius: 10,
        fill: new Fill({
          color: "rgba(255, 255, 0, 0.1)",
        }),
        stroke: new Stroke({
          color: "magenta",
        }),
      }),
    }),
    Circle: new Style({
      stroke: new Stroke({
        color: "red",
        width: 2,
      }),
      fill: new Fill({
        color: "rgba(255, 255, 0, 0.1)",
      }),
    }),
  };

  const tileLayer = new TileLayer({
    source: new OSM({
      url:
        "https://api.mapbox.com/styles/v1/usman-ghauri/cl38ebe0r000816nyb6w4dmiz/draft/tiles/{z}/{x}/{y}?access_token=" +
        key,
    }),
  });
  //   const style = new Style({
  //     fill: new Fill({
  //       color: "#eeeeee",
  //     }),
  //   });

  //following commented code will give you the filled color map
  //   const vectorLayer = new VectorLayer({
  //     source: new VectorSource({
  //       //uncomment following line to include portland.json
  //         url: portland,
  //     //   url: "https://openlayers.org/data/vector/ecoregions.json",
  //       format: new GeoJSON(),
  //     }),
  //     style: function (feature) {
  //       const color = feature.get("COLOR") || "#eeeeee";
  //       style.getFill().setColor(color);
  //       return style;
  //     },
  //   });

  const vectorLayer = new VectorLayer({
    source,
    style: (feature) => {
      return styles[feature.getGeometry().getType()];
    },
    properties: {
      id: "main-layer",
      name: "Portaland",
    },
  });

  const vectorTileLayer = new VectorTileLayer({
    declutter: true,
    source: new VectorTileSource({
      attributions:
        '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> ' +
        '© <a href="https://www.openstreetmap.org/copyright">' +
        "OpenStreetMap contributors</a>",
      format: new MVT(),
      url:
        "https://{a-d}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v6/" +
        "{z}/{x}/{y}.vector.pbf?access_token=" +
        key,
    }),
    //style: createMapboxStreetsV6Style(Style, Fill, Stroke, Icon, Text),
    //TODO: You can styles it as you want using mapbox
  });
  const mapview = new View({
    center: [0, 0],

    zoom: 2,
  });
  const functions = defaults().extend([
    new ScaleLine(),
    new Rotate(),
    new FullScreen(),
    new ZoomSlider(),
    new ZoomToExtent(),
    new MousePosition(),
    new OverviewMap(),
  ]);
  let second_vectorTileLayer = new VectorTileLayer({
    source: new VectorTileSource({
      // Please do not use this service this is for demo only. TODO: add your own service URL here
      //   url: 'http://3.106.156.204:8080/geoserver/gwc/service/tms/1.0.0/farmfoundation:nz_parcels@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf',
      format: new MVT(),
    }),
    visible: true,
  });
  let initialMap;
  useEffect(() => {
    initialMap = new Map({
      target: mapElement.current,
      interactions: defaultInteractions().extend([new DragRotateAndZoom()]),
      controls: functions,
      layers: [tileLayer, vectorLayer, vectorTileLayer, second_vectorTileLayer],
      view: mapview,
    });
    setMap(initialMap);
  }, []);

  useEffect(() => {
    if (map) {
      map.addInteraction(new Snap({ source }));
      draw = new Draw({
        source,
        type: "Circle",
      });
      map.addInteraction(draw);
      draw.on("drawstart", () => {
        console.log("inside draw on");
      });
      draw.on("drawend", () => {
        console.log("inside draw end");
      });

      modify = new Modify({ source });

      modify.on("modifystart", (event) => {});

      addFeature();
      map.on("click", () => {
        console.log("postclick,");
      });
    }
  }, [map]);

  //dd
  //dd

  const addFeature = () => {
    let markerFeature = new Feature({
      geometry: new Point([7579648.5988, 3416429.4162]),
    });
    let layer;
    map.getLayers().forEach((lr) => {
      if (lr.getProperties()["id"] === "main-layer") {
        layer = lr;
      }
    });
    layer && layer.getSource().addFeature(markerFeature);
  };

  // Remove a feature from a specific layer i.e. 'main-layer'
  const removeFeature = (feature) => {
    let layer;
    map.getLayers().forEach((lr) => {
      if (lr.getProperties()["id"] === "main-layer") {
        layer = lr;
      }
    });
    layer && layer.getSource().removeFeature(feature);
  };

  const transformProjection = (feature, coordinates) => {
    let trans = transform(coordinates, "EPSG:3857", "EPSG:4326");
    console.log("trans = ", trans);
    feature.getGeometry().transform("EPSG:4326", "EPSG:3857");
  };
  const showHideLayer = (event) => {
    map.getLayers().forEach((lr) => {
      if (lr.getProperties()["id"] === "main-layer") {
        lr.setVisible(event.target.checked);
      }
    });
  };
  const manageInteractions = (event,age =5) => {
   console.log(event.target.id , event.target.value,age)
    if (event.target.value === "draw") {
      map.addInteraction(draw);
      map.removeInteraction(modify);
    } else {
      map.removeInteraction(draw);
      map.addInteraction(modify);
    }
  };
  return (
    <Fragment>
      <div className="map" ref={mapElement} />
      <div id="info" className="layer-switcher">
        <div>
          <input
            type="checkbox"
            name="main-layer"
            id="lr"
            age ="s"
            defaultChecked
            onClick={showHideLayer}
          />
          <label htmlFor="lr">Show/Hide Main Layer</label>
        </div>
        <div>
          <input
            type="radio"
            name="interactions"
            value="draw"
            id="r-lr"
            defaultChecked
            onChange={manageInteractions}
          />
          <label>Draw</label>
          <input
            type="radio"
            name="interactions"
            value="modify"
            id="r1-lr"
            onChange={manageInteractions}
          />
          <label htmlFor="r1-lr">Modify</label>
        </div>
      </div>
    </Fragment>
  );
}

export default App;
