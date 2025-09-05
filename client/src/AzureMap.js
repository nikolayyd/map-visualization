import { useEffect, useRef, useState } from "react";
import * as atlas from "azure-maps-control";
import "./AzureMap.css";

function AzureMap() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const pointSourceRef = useRef(null);
  const routeSourceRef = useRef(null);
  const hasFetched = useRef(false);
  const [enabledAdding, setEnabledAdding] = useState(false);

  useEffect(() => {
    const map = new atlas.Map(mapRef.current, {
      center: [25.64186, 42.66115],
      zoom: 7,
      minZoom: 6.5,
      maxZoom: 13,
      language: "bg-BG",
      pitch: 0,
      enableClickableLogo: false,
      enableSearchLogo: false,
      showCopyright: false,
      showDashboard: true,
      showLogo: false,
      view: "Auto",
      authOptions: {
        authType: "subscriptionKey",
        subscriptionKey: process.env.REACT_APP_AZURE_MAPS_KEY
      }
    });
    
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchPL();
      fetchPST().then((points) => {
        createPoints(points);
      });
    }

    map.events.add("ready", () => {
      const pointSource = new atlas.source.DataSource(null, {
        cluster: true,
        clusterRadius: 45,
        clusterMaxZoom: 15
      });
      map.sources.add(pointSource);
      pointSourceRef.current = pointSource;

      const routeSource = new atlas.source.DataSource();
      map.sources.add(routeSource);
      routeSourceRef.current = routeSource;

      const routeLayer = new atlas.layer.LineLayer(routeSource, null, {
        strokeColor: ["get", "color"],
        strokeWidth: 3,
        lineJoin: "round",
        lineCap: "round",
        lineHitTestWidth: 30
      });

      const pointCluster = new atlas.layer.SymbolLayer(pointSource, null, {
        iconOptions: { 
          // image: "pin-blue",
          size: 1.2
        },
        textOptions: { 
          textField: ["get", "point_count_abbreviated"], 
          color: "black", 
          offset: [0, -1.6], 
          anchor: "center" 
        },
        lineHitTestWidth: 10
      });
  
      const pointLayer = new atlas.layer.SymbolLayer(pointSource, null, {
        iconOptions: {
          // image: "pin-blue", 
          size: 1.2
        },
        filter: ["!", ["has", "point_count"]]
      });

      const popup = new atlas.Popup({
        pixelOffset: [0, -18],
        closeButton: true,
        closeOnClick: true
      });

      map.layers.add([routeLayer, pointCluster, pointLayer]);

      map.events.add('click', routeLayer, (e) => {
        if (e.shapes && e.shapes.length > 0) {
          const feature = e.shapes[0]; 
          fetchInfoPL(feature.data.properties.id).then(({volt,name}) => {
            popup.setOptions({
              content: `<div style="padding: 10px;"> Волт: ${volt}<br>Име: ${name}`,
              position: e.position
            });
            popup.open(map);
            });
          }
      });

      map.events.add('click', pointLayer, (e) => {
          if (e.shapes && e.shapes.length > 0) {
            const feature = e.shapes[0]; 
            popup.setOptions({
              content: `<div style="padding: 10px;">Име: ${feature.data.properties.name}
                                                <br>Локация: ${feature.data.properties.sap_location}
                                                <br>${feature.data.properties.name_a}
                                                <br>${feature.data.properties.name_b}
                                                <br>${feature.data.properties.color}</div>`,
              position: e.position
            });
            popup.open(map);
          }
      });
   });
    mapInstance.current = map;
    return () => map.dispose();
  }, []);


  // useEffect(() => {
  //   if (!mapInstance.current || !enabledAdding) return;
  //   const map = mapInstance.current;
  //   const clickHandler = (e) => {
  //     const coords = e.position;
  //     const newPoint = new atlas.data.Point(coords);
  //     pointSourceRef.current.add(newPoint);
  //     setEnabledAdding(false);
  //   };

  //   map.events.add("click", clickHandler);
  //   return () => {
  //     map.events.remove("click", clickHandler);
  //   };

  // }, [enabledAdding]);

const createLines = (result) => {
  let currentId = null;
  let currentLine = [];
  let currentColor = null;

  routeSourceRef.current.clear();
  for (const row of result) {
    if (row.PL_Names_id !== currentId) {
      if (currentLine.length > 0) {
        routeSourceRef.current.add(new atlas.data.Feature(
          new atlas.data.LineString(currentLine)
          ,{
            id: row.PL_Names_id, 
            color: currentColor,
           }
        ));
      }
      currentId = row.PL_Names_id;
      currentLine = [];
      currentColor = row.color;
    }

    currentLine.push([row.Longitude, row.Latitute]);
  }

  if (currentLine.length > 0) {
    routeSourceRef.current.add(
      new atlas.data.Feature(new atlas.data.LineString(currentLine))
    );
  }
};

const createPoints = (result) => {
  let loadedPoints = [];
  for(const row of result) {
    loadedPoints.push(
      new atlas.data.Feature(
          new atlas.data.Point([row.Longitude, row.Latitute]), 
          {
              id: Number(row.id),
              name: row.name,
              name_a: row.name_a,
              name_b: row.name_b,
              sap_location: row.sap_location,
              color: row.color
          }
      )
  );
  }
  pointSourceRef.current.add(loadedPoints);
}

  const fetchPL = async () => {
    try {
      const response = await fetch(`http://localhost:5000/get-routes`);
      const data = await response.json();
      createLines(data.result);
      
    } catch (err) {
      console.error("Error on getting routes:", err);
    }
  }

  const fetchPST = async () => {
    try {
      const response = await fetch(`http://localhost:5000/get-points`);
      const data = await response.json();
      return data.result;
    }
    catch (err) {
      console.error("Error on getting PST:", err);
    }
  }

  const fetchInfoPL = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/get-line-info/${id}`);
      const data = await response.json();
      return {volt: data.volt,name: data.name};
    }
    catch(err) {
      console.error("error on getting info PL: ", err);
    }
  }

  return (
    <div>
      <button onClick={() => setEnabledAdding(true)}>Add PL</button>
      <div ref={mapRef} id="myMap"/>
    </div>
  );
}

export default AzureMap;