import * as ol from "ol";
import "ol/ol.css";
import "./App.css";
import { Interaction as interaction } from "ol";
import Feature from "ol/Feature";
import Map from "ol/Map";
import Point from "ol/geom/Point";
import View from "ol/View";
import {
  Circle as CircleStyle,
  Circle,
  Fill,
  Icon,
  Stroke,
  Style,
  Text,
} from "ol/style";
import { Cluster, OSM, Vector as VectorSource } from "ol/source";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { boundingExtent } from "ol/extent";
import { Fragment, useEffect, useState, useRef } from "react";
import url from "./assets/data.geojson";
import { GeoJSON, MVT,WKT } from "ol/format";
import ClusterSource from "ol/source/Cluster";
import HeatMapLayer from "ol/layer/Heatmap";
import ReactTooltip from "react-tooltip";
import marki from "./marker4.png";
import React from "react";
import portland from "./assets/portland.geojson";
import { transform } from "ol/proj";
import { Draw, Snap } from "ol/interaction";
import { Modify } from "ol/interaction";
import { Button, Modal } from "antd";
import "antd/dist/antd.css";
import VectorTileLayer from "ol/layer/VectorTile";
import VectorTileSource from "ol/source/VectorTile";
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
import { set } from "ol/transform";
import buffer from '@turf/buffer';
import { polygon } from '@turf/turf';
import { io,operation } from "jsts";


// const jsts = require("jsts")
function App() {
  //const myref = React.createRef();
  //   const [distanceInput,setDistanceInput]=useState();
  //   const [minDistanceInput,setMinDistanceInput] =useState();
  //   const [initialMap,setInitialMap] = useState();

  // const ClusterDistanceHandler = (e) => {
  //   setDistanceInput(e.target.value);
  //   console.log("value",e.target.value);
  // }
  // const minDistanceHandler =(e) => {
  //   setMinDistanceInput(e.target.value);
  //   console.log("value",e.target.value);
  // }
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [source, setSource] = useState(
    new VectorSource({
      url: portland,
      format: new GeoJSON(),
    })
  );
  //const [map,setMap]=useState();
  let map;
  // const jsts = require("jsts")
  const mapElement = useRef();
  const mapRef = useRef();
  mapRef.current = map;
  let draw = Draw;
  let modify = Modify;
  const styleCache = {};
  var info;
  var overlay;
  let displayStyle = "none";
  const [featureType, setFeatureType] = useState("null");
  const key =
    "pk.eyJ1IjoidXNtYW4tZ2hhdXJpIiwiYSI6ImNsMzRnNm9lczE3MzMzZHBmejFwb3RtNHgifQ.x89dbT1H4iK7NQaKnkbxQw";
  // let tempPolygon =
  //   "POLYGON ((7.734374999999999 -34.30714385628803, 43.2421875 -34.30714385628803, 43.2421875 -15.623036831528252, 7.734374999999999 -15.623036831528252, 7.734374999999999 -34.30714385628803))";

  let tempPolygon =
    "POLYGON ((-10.8984375 57.70414723434193, 5.80078125    57.61010702068388, -4.306640625 50.736455137010665, -10.892944335937498 57.70121216638347,-10.8984375 57.70414723434193))";
  
  let source2 = new ClusterSource({
    distance: 20,
    source: new VectorSource({
      url: url,
      format: new GeoJSON(),
    }),
  });

  const image = new Icon({
    anchor: [0.5, 1],
    imgSize: [32, 48],
    src: marki,
  });
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

  var fill = [
    {
      size: 0,
      color: "#3399CC",
    },
    {
      size: 15,
      color: "#FABA3E",
    },
    {
      size: 50,
      color: "#EF4A37",
    },
  ];
  const clusters = new VectorLayer({
    source: source2,
    style: function (feature) {
      const size = feature.get("features").length;
      let style = styleCache[size];
      var tempFill;
      fill.forEach((element) => {
        if (size > element.size) {
          tempFill = element.color;
        }
      });
      if (!style) {
        style = clusterStyles(tempFill, size);
        styleCache[size] = style;
      }
      return style;
    },
    properties: {
      id: "cluster-layer",
      name: "Portaland",
    },
  });
  const clusterStyles = (tempFill, size) => {
    return [
      new Style({
        image: new CircleStyle({
          radius: 10,
          stroke: new Stroke({
            color: "#fff",
          }),
          fill: new Fill({
            color: tempFill,
          }),
        }),
        text: new Text({
          text: size.toString(),
          fill: new Fill({
            color: "#fff",
          }),
        }),
      }),
      new Style({
        image: new CircleStyle({
          radius: 12,
          stroke: new Stroke({
            color: tempFill,
            lineDash: [9, 5],
            lineCap: "round",
            width: 2,
          }),
        }),
      }),
      new Style({
        image: new CircleStyle({
          radius: 14,
          stroke: new Stroke({
            color: tempFill,
            lineDash: [8, 9],
            lineCap: "round",
            width: 2,
          }),
        }),
      }),
    ];
  };
  const tileLayer = new TileLayer({
    // source: new OSM()
    source: new OSM({
      url:
        "https://api.mapbox.com/styles/v1/usman-ghauri/cl38eaqeu003c14qkvnnarmgb/draft/tiles/{z}/{x}/{y}?access_token=" +
        key,
    }),
  });
  const vectorLayer1 = new VectorLayer({
    source,
    style: (feature) => {
      return styles[feature.getGeometry().getType()];
    },
    properties: {
      id: "main-layer",
      name: "Portaland",
    },
  });

  const vectorLayer2 = new VectorTileLayer({
    declutter: true,
    source: new VectorTileSource({
      attributions:
        '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> ',
      // +'© <a href="https://www.openstreetmap.org/copyright">' +
      // 'OpenStreetMap contributors</a>'
      format: new MVT(),
      // url:
      //   'https://{a-d}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v6/' +
      //   '{z}/{x}/{y}.vector.pbf?access_token=' +
      //     key,
    }),
    // style: createMapboxStreetsV6Style(Style, Fill, Stroke, Icon, Text),TODO: You can styles it as you want using mapbox
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
  let initialMap;
  useEffect(() => {
    initialMap = new Map({
      layers: [
        tileLayer,
         vectorLayer1,
         vectorLayer2,
        getHeatMapLayer,
        clusters,
      ],
      target: "map",
      controls: functions,
      view: new View({
        center: [1391708.0832, 5238535.2965],
        zoom: 2,
      }),
    });
    //etMap(initialMap);
    map = initialMap;
    if (map) {
      map.on("click", (e) => {
        clusters.getFeatures(e.pixel).then((clickedFeatures) => {
          if (clickedFeatures.length) {
            // Get clustered Coordinates
            const features = clickedFeatures[0].get("features");
            if (features.length > 1) {
              const extent = boundingExtent(
                features.map((r) => r.getGeometry().getCoordinates())
              );
              map
                .getView()
                .fit(extent, { duration: 1000, padding: [50, 50, 50, 50] });
            }
          }
        });
      });
      debugger
      addFeature();
    }

    return () => map.setTarget(undefined);
  },[]);
  useEffect(() => {
    if (map) {
      map.addInteraction(new Snap({ source }));
      draw = new Draw({
        source,
        type: 'LineString',
        // TODO: BElow is the available draw types provided by Openlayers
        // Point
        // LineString
        // Polygon
        // Circle
      });
   debugger;
      map.addInteraction(draw);
      draw.on('drawend', (event) => {
        debugger;
        // Perform Task on when interaction ends
        let polygonArray  = [];
        let layer = getLayer('main-layer');
        layer
          .getSource()
          .getFeatures()
          .forEach((feat) => {
            if (feat.getGeometry().getType() === 'Point') {
              debugger;
              return;}
            // jsts polygon spilliting code
            const reader = new  io.WKTReader();
            const writer = new  io.WKTWriter();
            const format = new WKT();
  
            const p = reader.read(format.writeGeometry(feat.getGeometry()));
            const result = operation.valid.IsValidOp.isValid(p);
            if (!result) return;
            let parcel = reader.read(format.writeGeometry(feat.getGeometry()));
            let line = reader.read(
              format.writeGeometry(event.feature.getGeometry())
            );
            let union = parcel.getBoundary().union(line);
             let polygonizer = new operation.polygonize.Polygonizer();
            polygonizer.add(union);
            let polygons = polygonizer.getPolygons();
            for (var i = polygons.iterator(); i.hasNext(); ) {
              let polygon = i.next();
              let feature = format.readFeature(writer.write(polygon));
              polygonArray.push(feature.clone());
            }
          });
  
        //layer.getSource().clear();
        layer.getSource().addFeatures([...polygonArray]);
        // remove feature is feature type is linestring. We have to remove the line that has splitted the polygon geometry
        layer.getSource().on('addfeature', (evt ) => {
          debugger;
          if (evt.feature.getGeometry().getType() === 'LineString')
            layer.getSource().removeFeature(evt.feature);
        });
        
      });




      // map.on("singleclick", (evt) => {
      //   // Perform Task on click
      //   // this.displayFeatureInfo(evt.pixel, info); // Disabled this method for tooltip vs popup
      //   debugger;
      //   // TODO: You need to remove draw/modify interation to test this
      //   const feature = map.forEachFeatureAtPixel(evt.pixel, (feature) => {
      //     return feature;
      //   });
      //   if (feature) {
      //     setFeatureType(feature.getGeometry().getType());
      //     showModal();
      //   }
      // });
      addBufferedPolygon();
    }

    return () => map.setTarget(undefined);
  },[]);
  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const d = (e) => {
    map.removeInteraction(draw);

    draw = new Draw({
      source,
      type: e.target.value,
    });
    //map.addInteraction(draw);
    console.log("draw", draw);
    map.addInteraction(draw);
    modify = new Modify({ source });
    // draw.on("drawstart", () => {
    //   console.log("inside draw on");
    // });
    // draw.on("drawend", () => {
    //   console.log("inside draw end");
    // });
  };

  const addFeature = () => {
    let markerFeature = new Feature({ geometry: new Point([0, 0]) });
    let layer;
    map.getLayers().forEach((lr) => {
      if (lr.getProperties()["id"] === "main-layer") {
        layer = lr;
      }
    });
    layer && layer.getSource().addFeature(markerFeature);
  };

  const tranformProjection = (feature, coordinates) => {
    // Transforms a coordinate from source projection to destination projection. This returns a new coordinate (and does not modify the original).
    let trans = transform(coordinates, "EPSG:3857", "EPSG:4326");
    // Geometry can be also be transformed from one projection to some other projection.
    feature.getGeometry().transform("EPSG:4326", "EPSG:3857");
  };
  const getHeatMapLayer = new HeatMapLayer({
    source: new VectorSource({
      url: url,
      format: new GeoJSON(),
    }),
    gradient: ["#00f", "#0ff", "#0f0", "#ff0", "#f00"],
    weight: (feature) => {
      var name = feature.getProperties().eventarr.time.length;
      var magnitude = parseFloat(name);
      return magnitude;
    },
    properties: {
      id: "heat-layer",
    },
  });

  const showHideLayer = (event) => {
    map.getLayers().forEach((lr) => {
      if (lr.getProperties()["id"] === "main-layer") {
        lr.setVisible(event.target.checked);
      }
    });
  };
  const showHideClusterLayer = (event) => {
    map.getLayers().forEach((lr) => {
      if (lr.getProperties()["id"] === "cluster-layer") {
        lr.setVisible(event.target.checked);
      }
    });
  };
  const showHideHeatLayer = (event) => {
    map.getLayers().forEach((lr) => {
      if (lr.getProperties()["id"] === "heat-layer") {
        lr.setVisible(event.target.checked);
      }
    });
  };
  let count = false;
  const manageInteractions = (event) => {
    if (event.target.value === "draw") {
      if (draw) {
        map.addInteraction(
          new Draw({
            source,
            type: "Point",
          })
        );
        map.removeInteraction(modify);
      } else {
        map.removeInteraction(draw);
        map.addInteraction(draw);
        map.removeInteraction(modify);
      }
    } else {
      map.removeInteraction(draw);
      map.addInteraction(modify);
    }
  };
  const rem = () => {
    map.getInteractions().forEach((interaction) => {
      if (interaction == "Modify") {
        debugger;
        map.removeInteraction(interaction);
      }
    });
    map.getInteractions().forEach((interaction) => {
      console.log("after removing ", interaction);
    });
  };
  const addBufferedPolygon=() =>{
    let wktFormat = new WKT();
    const geoJsonFormat = new GeoJSON();

    let feature = wktFormat.readFeature(tempPolygon);
    let bufferedPolygon = buffer(
      polygon(feature.getGeometry().getCoordinates()),
      100,
      { units: 'kilometers' }
    ); 
    let bufferedPolygon1= buffer(
      polygon(feature.getGeometry().getCoordinates()),
      200,
      { units: 'kilometers' }
    );
    let bufferedFeatureOl = geoJsonFormat.readFeature(bufferedPolygon);
    let bufferedFeatureO2 = geoJsonFormat.readFeature(bufferedPolygon1);
    feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
    bufferedFeatureOl.getGeometry().transform('EPSG:4326', 'EPSG:3857');
    bufferedFeatureO2.getGeometry().transform('EPSG:4326', 'EPSG:3857');

    let layer =  getLayer('main-layer');
    layer && layer.getSource().addFeatures([feature, bufferedFeatureOl,bufferedFeatureO2]);
  }
  const getLayer =(id)=> {
    let layer;
     map.getLayers().forEach((lr) => {
      if (lr.getProperties()['id'] === id) {
        layer = lr;
      }
    });
    return layer;
  }
  return (
    <div>
      <div>
        <Modal
          title="Feature PopUp"
          visible={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          style={{ position: "absolute", left: "30%" }}
        >
          <p
            style={{
              fontSize: "50px",
              fontWeight: "400",
              fontFamily: "initial",
              textAlign: "center",
              height: "30px",
            }}
          >
            Feature type: {featureType}
          </p>
        </Modal>
      </div>
      <div id="map" ref={mapElement} className="map" style={{color:"white"}}>
        <div className="layer-switcher">
          <input
            type="checkbox"
            name="main-layer"
            id="lr"
            defaultChecked
            onChange={showHideLayer}
          />
          <label htmlFor="lr">Show/Hide Main Layer</label>
          <input
            type="checkbox"
            name="cluster-layer"
            id="lr3"
            defaultChecked
            onChange={showHideClusterLayer}
          />
          <label htmlFor="lr3">Show/Hide Cluster Layer</label>
          <input
            type="checkbox"
            name="heat-layer"
            id="lr4"
            defaultChecked
            onChange={showHideHeatLayer}
          />
          <label htmlFor="lr4">Show/Hide Cluster Layer</label>
          <div style={{ position: "absolute", left: "40%" }}>
            {/* <input
              type="radio"
              name="interactions"
              value="draw"
              id="r-lr"
              onChange={manageInteractions}
            />
            <label>Draw</label> */}
            <input
              type="radio"
              name="interactions"
              value="modify"
              id="r1-lr"
              onChange={manageInteractions}
            />
            <label htmlFor="r1-lr">Modify</label>
            <input
              type="radio"
              name="interactions"
              value="Point"
              id="r11"
              onChange={d}
            />
            <label htmlFor="r1-lr">Point</label>
            <input
              type="radio"
              name="interactions"
              value="Circle"
              id="r12"
              onChange={d}
            />
            <label htmlFor="r1-lr">Circle</label>
          </div>
        </div>
      </div>
    </div>
  );
}
export default App;
