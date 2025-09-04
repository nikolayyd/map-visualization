import { useEffect, useRef, useState } from "react";
import * as atlas from "azure-maps-control";
import "./AzureMap.css";

// const coordinates1= [[23.3219, 42.6977], [23.4500, 42.6552], [23.5780, 42.6123],
//                 [23.7055, 42.5690], [23.8325, 42.5253], [23.9590, 42.4812],
//                 [24.0850, 42.4365], [24.2105, 42.3914], [24.3355, 42.3459],
//                 [24.4600, 42.3000], [24.5840, 42.2537], [24.7070, 42.2070],
//                 [24.8250, 42.1800], [24.9350, 42.1570], [24.7453, 42.1354]]

// const coordinates2= [[24.7453, 42.1354], [24.8700, 42.1500], [24.9950, 42.1650],
//                 [25.1200, 42.1800], [25.2450, 42.1950], [25.3700, 42.2100],
//                 [25.4950, 42.2250], [25.6200, 42.2400], [25.7450, 42.2550],
//                 [25.8700, 42.2700], [25.9950, 42.2850], [26.1200, 42.3000],
//                 [26.2450, 42.3150], [26.3700, 42.3300], [26.4950, 42.3450],
//                 [26.6200, 42.3600], [26.7450, 42.3750], [26.8700, 42.3900],
//                 [26.9950, 42.4050], [27.1200, 42.4200], [27.2350, 42.4350]]
// const coordinates3= [[23.3219, 42.6977],[23.4500, 42.7480], [23.5780, 42.7980],
//                 [23.7050, 42.8475], [23.8320, 42.8965], [23.9580, 42.9450],
//                 [24.0835, 42.9930], [24.2085, 43.0405], [24.3330, 43.0875],
//                 [24.4570, 43.1340], [24.5805, 43.1800], [24.7035, 43.2255],
//                 [24.8260, 43.2705], [24.9480, 43.3150], [25.0695, 43.3590],
//                 [25.1905, 43.4025], [25.3110, 43.4455], [25.4310, 43.4880],
//                 [25.5505, 43.5300], [25.6695, 43.5715], [25.7880, 43.6125],
//                 [25.9060, 43.6530], [26.0235, 43.6930]]

// const coordinates4= [[24.6067, 43.4170], [24.7000, 43.4800], [24.7930, 43.5420],
//                 [24.8855, 43.6035], [24.9775, 43.6645], [25.0690, 43.7250],
//                 [25.1600, 43.7850], [25.2505, 43.8445], [25.3405, 43.9035],
//                 [25.4300, 43.9620], [25.5190, 44.0200], [25.6075, 44.0775],
//                 [25.6955, 44.1345], [25.7830, 44.1910], [25.8700, 44.2470],
//                 [25.9565, 44.3025], [26.0425, 44.3575]]

function AzureMap() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const pointSourceRef = useRef(null);
  const routeSourceRef = useRef(null);
  const hasFetched = useRef(false);

  const [enabledAdding, setEnabledAdding] = useState(false);
  // const [points, setPoints] = useState([]);

  // useEffect(() => {
  //   if (pointSourceRef.current) {
  //     pointSourceRef.current.clear();
  //     pointSourceRef.current.add(points);

  //     // if (points.length >= 2) {
  //     //   updateRoute(points);
  //     // }
  //   }
  // }, [points]);

  useEffect(() => {
    const map = new atlas.Map(mapRef.current, {
      center: [25.64186, 42.66115],
      zoom: 7,
      minZoom: 6.5,
      maxZoom: 12,
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
      },
    });

    map.events.add("ready", () => {
      const pointSource = new atlas.source.DataSource(null, { cluster: true, clusterRadius: 45, clusterMaxZoom: 15 });
      map.sources.add(pointSource);
      pointSourceRef.current = pointSource;

      const routeSource = new atlas.source.DataSource();
      map.sources.add(routeSource);
      routeSourceRef.current = routeSource;

      if (!hasFetched.current) {
        hasFetched.current = true;
        fetchPL();
        fetchPST();
      }

      // if (localStorage.getItem("points")) {
      //   const loadedPoints = JSON.parse(localStorage.getItem("points")).map((coords) => new atlas.data.Point(coords));
      //   pointSource.add(loadedPoints);
      //   // if (loadedPoints.length >= 2) {
      //   //   updateRoute(loadedPoints);
      //   // }
      //   setPoints(loadedPoints);
      // }

      map.layers.add([
        new atlas.layer.SymbolLayer(pointSource, null, {
          iconOptions: { image: "pin-red", size: 2 },
          textOptions: { textField: ["get", "point_count_abbreviated"], color: "black", offset: [0, -1.6], anchor: "center" },
        }),
        new atlas.layer.SymbolLayer(pointSource, null, {
          iconOptions: { image: "pin-red", size: 1.5 },
          filter: ["!", ["has", "point_count"]],
        }),
      ]);

      map.layers.add(new atlas.layer.LineLayer(routeSource, null, {
        strokeColor: "red",
        strokeWidth: 2,
        lineJoin: "round",
        lineCap: "round",
      }));

      mapInstance.current = map;
    });

    return () => map.dispose();
  }, []);

  useEffect(() => {
    if (!mapInstance.current || !enabledAdding) return;
    const map = mapInstance.current;
    const clickHandler = (e) => {
      const coords = e.position;
      const newPoint = new atlas.data.Point(coords);
      pointSourceRef.current.add(newPoint);
      setEnabledAdding(false);
    };

    map.events.add("click", clickHandler);
    return () => {
      map.events.remove("click", clickHandler);
    };

  }, [enabledAdding]);

const createLines = (result) => {
  let currentId = null;
  let currentLine = [];
  routeSourceRef.current.clear();
  for (const row of result) {
    if (row.PL_Names_id !== currentId) {
      if (currentLine.length > 0) {
        routeSourceRef.current.add(new atlas.data.Feature(new atlas.data.LineString(currentLine)));
      }
      currentId = row.PL_Names_id;
      currentLine = [];
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
    loadedPoints.push(new atlas.data.Point([row.Longitude, row.Latitute]));
  }
  pointSourceRef.current.add(loadedPoints);
}


// <-- commented code is for connecting each point to other without known lines -->
//   const createRoute = (recordset) => {
//     if (!routeSourceRef.current || pointsArray.length < 2) return;
//     const coords = pointsArray.map(p => p.coordinates);
//     const sortedCoords = coords.slice().sort((a, b) => a[0] - b[0]);
//   };

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
      createPoints(data.result);

    }
    catch (err) {
      console.error("Error on getting PST:", err);
    }
  }


  return (
    <div>
      <button onClick={() => setEnabledAdding(true)}>Add PL</button>
      <div ref={mapRef} id="myMap" />
    </div>
  );
}

export default AzureMap;