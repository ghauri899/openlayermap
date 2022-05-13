import React, { useState, useEffect, useRef } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import {MVT} from "ol/format"
import OSM from "ol/source/OSM";
import portland from "./assets/GeoJson/portland.geojson";
import "ol/ol.css";
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
} from "ol/interaction";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { GeoJSON } from "ol/format";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";
import VectorTileLayer from "ol/layer/VectorTile";
import VectorTileSource from "ol/source/VectorTile";
import { Fragment } from "react/cjs/react.production.min";

function App() {
  let key = "pk.eyJ1IjoidXNtYW4tZ2hhdXJpIiwiYSI6ImNsMzRnNm9lczE3MzMzZHBmejFwb3RtNHgifQ.x89dbT1H4iK7NQaKnkbxQw";

  const [map, setMap] = useState();
  const mapElement = useRef();
  const mapRef = useRef();
  mapRef.current = map;
  const tileLayer = new TileLayer({
    source: new OSM(),
  });
  const style = new Style({
    fill: new Fill({
      color: "#eeeeee",
    }),
  });

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
    source: new VectorSource({
      //uncomment following line to include portland.json
        url: portland,
    //   url: "https://openlayers.org/data/vector/ecoregions.json",
      format: new GeoJSON(),
    }),
    style: new Style({
        stroke: new Stroke({
          color: 'red',
          width: 2,
        }),
      }),
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
      // style: createMapboxStreetsV6Style(Style, Fill, Stroke, Icon, Text),TODO: You can styles it as you want using mapbox
    });
  const mapview = new View({
    center: [0, 0],
    zoom: 5,
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

  useEffect(() => {
    let initialMap = new Map({
      target: mapElement.current,
      interactions: defaultInteractions().extend([new DragRotateAndZoom()]),
      controls: defaults().extend([
        new ScaleLine(),
        new Rotate(),
        new FullScreen(),
        new ZoomSlider(),
        new ZoomToExtent(),
        new MousePosition(),
        new OverviewMap(), 
      ]),
      layers: [tileLayer, vectorLayer],
      view: mapview,
    });
    setMap(initialMap);
  }, []);

  //dd

  //this commented code is for hovering over map 
  // const featureOverlay = new VectorLayer({
  //     source: new VectorSource(),
  //     map: initialMap,
  //     style: new Style({
  //       stroke: new Stroke({
  //         color: 'rgba(255, 255, 255, 0.7)',
  //         width: 2,
  //       }),
  //     }),
  //   });

  //   let highlight;
  //   const displayFeatureInfo = function (pixel) {
  //     const feature = initialMap.forEachFeatureAtPixel(pixel, function (feature) {
  //       return feature;
  //     });

  //     const info = document.getElementById('info');
  //     if (feature) {
  //       info.innerHTML = feature.get('ECO_NAME') || '&nbsp;';
  //     } else {
  //       info.innerHTML = '&nbsp;';
  //     }

  //     if (feature !== highlight) {
  //       if (highlight) {
  //         featureOverlay.getSource().removeFeature(highlight);
  //       }
  //       if (feature) {
  //         featureOverlay.getSource().addFeature(feature);
  //       }
  //       highlight = feature;
  //     }
  //   };

  //   initialMap.on('pointermove', function (evt) {
  //     if (evt.dragging) {
  //       return;
  //     }
  //     const pixel = initialMap.getEventPixel(evt.originalEvent);
  //     displayFeatureInfo(pixel);
  //   });

  //   initialMap. ('click', function (evt) {
  //     displayFeatureInfo(evt.pixel);
  //   });

  //dd
  return (
    <Fragment>
      <div
        style={{ height: "100vh", width: "100%" }}
        ref={mapElement}
        className="map-container"
      />
      <div id="info"></div>
    </Fragment>
  );
}

export default App;
