import "ol/ol.css"
import { Map, View } from "ol"
import TileLayer from "ol/layer/Tile.js"
import XYZ from "ol/source/XYZ.js";
import { fromLonLat, Projection } from "ol/proj.js"
import { useEffect, useState } from "react";
import GeoJSON from 'ol/format/GeoJSON.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import Link from 'ol/interaction/Link.js';
import OSM from 'ol/source/OSM.js';
import DragAndDrop from 'ol/interaction/DragAndDrop.js';
import Modify from 'ol/interaction/Modify.js';
import Draw from "ol/interaction/Draw.js"
import Snap from "ol/interaction/Snap.js"
import base from "./base.module.scss"
import { Style, Fill, Stroke, Icon } from "ol/style.js"
import { getArea } from "ol/sphere.js";
import colormap from "colormap";
import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js"
import { circular } from "ol/geom/Polygon.js";
import Control from "ol/control/Control.js";
import kompas from 'kompas';
import { getCenter } from "ol/extent.js";
import GeoTIFF from "ol/source/GeoTIFF.js"
import Layer from "ol/layer/Layer.js";
import WebGLTileLayer from "ol/layer/WebGLTile.js"
import { color } from "highcharts";
import { EventOptionsObject } from "highcharts";
import MVT from "ol/format/MVT.js"
import VectorTileLayer from "ol/layer/VectorTile.js"
import VectorTileSource from "ol/source/VectorTile.js"
import MapboxVectorLayer from "ol/layer/MapboxVector.js"
import { fromExtent } from "ol/geom/Polygon.js"
import Stamen from "ol/source/Stamen.js"
import falseCsvData from "./falseCsv.json"
import WebGLPointLayer from "ol/layer/WebGLPoints.js"

let map: Map

// const source = new VectorSource({
//   format: new GeoJSON(),
//   url: '/src/pages/openlayer/guangdong.json',
// })
// const source = new VectorSource();
const style1 = new Style({
  fill: new Fill({
    color: 'red'
  }),
  stroke: new Stroke({
    color: 'white'
  })
})
const style2 = new Style({
  fill: new Fill({
    color: 'orange'
  }),
  stroke: new Stroke({
    color: 'purple'
  })
})

const imgStyle = new Style({
  fill: new Fill({
    color: 'rgba(0, 0, 255, 0.2)'
  }),
  image: new Icon({
    src: '/src/assets/images/gas.png',
    size: [30, 40],
    rotateWithView: true
  })
})
// const layer = new VectorLayer({
//   source,
//   style: function (features) {
//     // let index = parseInt(features.ol_uid)
//     // return index % 4 ? style1 : style2

//     return new Style({
//       fill: new Fill({
//         color: getColor(features)
//       }),
//       stroke: new Stroke({
//         color: 'rgba(255, 255, 255, 0.4)'
//       })
//     })
//   }
// })
// const layer = new VectorLayer({
//   source
// });
// layer.setStyle(imgStyle)
function clearSource() {
  source.clear()
}
function downloadData() {
  const format = new GeoJSON({ featureProjection: 'EPSG: 3857' });
  const features = source.getFeatures()
  const json = format.writeFeature(features)
}

const min = 1e6
const max = 2e11
const steps = 50
const ramp = colormap({
  colormap: 'blackbody',
  nshades: steps
})
function clamp(value: number, low: number, high: number) {
  return Math.max(low, Math.min(value, high))
}
function getColor(feature) {
  const area = getArea(feature.getGeometry());
  const f = Math.pow(clamp((area - min) / (max - min), 0, 1), 1 / 2)
  const index = Math.round(f * (steps - 1))
  return ramp[index]
}

function doLocation(map) {
  const locate = document.createElement('div');
  locate.className = 'ol-control ol-unselectable ' + base.locate;
  locate.innerHTML = '<button title="Locate me">◎</button>';

  locate.addEventListener('click', function () {
    if (!source.isEmpty()) {
      var options = {
        enableHighAccuracy: true,
        timeout: 50000,
        maximumAge: 0,
      };
      navigator.geolocation.getCurrentPosition(function (data) {
        let point = fromLonLat([data.coords.longitude, data.coords.latitude])
        point[2] = point[0] + 1000
        point[3] = point[1] + 1000
        map.getView().fit(point, {
          maxZoom: 18,
          duration: 500,
        });
      }, function (err) {
        console.log('err', err)
      }, options)
    }
  });
  // 图片随手机转动而转动
  // window.addEventListener('deviceorientation', function () {
  //   startCompas()
  // })
  // map.addControl(
  //   new Control({
  //     element: locate,
  //   })
  // );
}
function startCompas() {
  kompas().watch().on('heading', function (heading: number) {
    imgStyle.getImage()?.setRotation(Math.PI * heading / 180)
    layer.getSource()?.changed()
  })
}

const projection = new Projection({
  code: 'EPSG:32721',
  units: 'm',
});
// metadata from https://s3.us-west-2.amazonaws.com/sentinel-cogs/sentinel-s2-l2a-cogs/21/H/UB/2021/9/S2B_21HUB_20210915_0_L2A/S2B_21HUB_20210915_0_L2A.json
const sourceExtent = [300000, 6090260, 409760, 6200020];

// use GeoTIFF
// const source = new GeoTIFF({
//   sources: [
//     {
//       url: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/21/H/UB/2021/9/S2B_21HUB_20210915_0_L2A/TCI.tif',
//     },
//   ],
// });

// false color composite
// const source = new GeoTIFF({
//   sources: [
//     {
//       url: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/21/H/UB/2021/9/S2B_21HUB_20210915_0_L2A/B08.tif',
//       max: 5000
//     },
//     {
//       url: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/21/H/UB/2021/9/S2B_21HUB_20210915_0_L2A/B04.tif',
//       max: 5000
//     },
//     {
//       url: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/21/H/UB/2021/9/S2B_21HUB_20210915_0_L2A/B03.tif',
//       max: 5000
//     }
//   ]
// })
// const layer = new WebGLTileLayer({
//   source: source,
// });

// band math
// const source = new GeoTIFF({
//   sources: [
//     {
//       url: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/21/H/UB/2021/9/S2B_21HUB_20210915_0_L2A/B04.tif',
//       max: 10000
//     },
//     {
//       url: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/21/H/UB/2021/9/S2B_21HUB_20210915_0_L2A/B08.tif',
//       max: 10000
//     }
//   ]
// })
const nir = ['band', 2]
const red = ['band', 1]
const difference = ['-', nir, red]
const sum = ['+', nir, red]
const ndvi = ['/', difference, sum]
// const layer = new WebGLTileLayer({
//   source,
//   style: {
//     color: [
//       'interpolate',
//       ['linear'],
//       ndvi,
//       -0.2,
//       [191, 191, 191],
//       0,
//       [255, 255, 254],
//       0.2,
//       [145, 191, 82],
//       0.4,
//       [79, 138, 46],
//       0.6,
//       [15, 84, 10]
//     ]
//   }
// })

// color maps
function getColorStops(name: string, min: number, max: number, steps: number, reverse: boolean) {
  const delta = (max - min) / (steps - 1)
  const stops = new Array(steps * 2)
  const colors = colormap({
    colormap: name,
    nshades: steps,
    format: 'rgba'
  })
  if (reverse) {
    colors.reverse()
  }
  for (let i = 0; i < steps; i++) {
    stops[i * 2] = min + i * delta
    stops[i * 2 + 1] = colors[i]
  }
  return stops
}
// const layer = new WebGLTileLayer({
//   source,
//   style: {
//     color: [
//       'interpolate',
//       ['linear'],
//       ndvi,
//       ...getColorStops('earth', -0.5, 1, 10, true)
//     ]
//   }
// })

// visualization chooser
const baseColor = [
  'interpolate',
  ['linear'],
  ndvi
]
interface visualizationObj {
  name: string,
  sources: Array<string>,
  max?: number,
  color?: Array<any>
}
const visualizations: Array<visualizationObj> = [
  {
    name: 'True Color',
    sources: ['TCI']
  },
  {
    name: 'False Color',
    sources: ['B08', 'B04', 'B03'],
    max: 5000
  },
  {
    name: 'NDVI',
    sources: ['B04', 'B08'],
    max: 10000,
    color: [
      ...baseColor,
      ...getColorStops('earth', -0.5, 1, 10, true)
    ]
  },
  {
    name: 'NDWI',
    sources: ['B03', 'B08'],
    max: 10000,
    color: [
      ...baseColor,
      ...getColorStops('viridis', -1, 1, 10, true)
    ]
  },
]

// visualization chooser image source
interface imageObj {
  name: string,
  base: string
}
const images: Array<imageObj> = [
  {
    name: 'Buenos Aires',
    base: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/21/H/UB/2021/9/S2B_21HUB_20210915_0_L2A'
  },
  {
    name: 'Minneapolis',
    base: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/15/T/WK/2021/9/S2B_15TWK_20210918_0_L2A'
  },
  {
    name: 'Cape Town',
    base: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/34/H/BH/2021/9/S2B_34HBH_20210922_0_L2A'
  }
]
function createLayer(base: string, visualization: visualizationObj) {
  const source = new GeoTIFF({
    sources: visualization.sources.map((id) => ({
      url: `${base}/${id}.tif`,
      max: visualization.max
    }))
  })
  return new WebGLTileLayer({
    source,
    style: {
      color: visualization.color
    }
  })
}
function changeVisualiztion(event: any) {
  let optionIndex = 0, imageIndex = 0
  let optionDoc = document.getElementById('visualiztionList')
  let imageDoc = document.getElementById('visualiztionImageList')
  if (optionDoc && optionDoc.selectedIndex) {
    optionIndex = optionDoc.selectedIndex
  }
  if (imageDoc && imageDoc.selectedIndex) {
    imageIndex = imageDoc.selectedIndex
  }
  let temp = visualizations[optionIndex]
  const base = images[imageIndex].base
  if (temp) {
    let layer = createLayer(base, temp)
    map.setLayers([layer])
    map.setView(layer.getSource().getView())
  }

}

// VectorTile layer
// const layer = new VectorTileLayer({
//   source: new VectorTileSource({
//     format: new MVT(),
//     url:
//       'https://ahocevar.com/geoserver/gwc/service/tms/1.0.0/' +
//       'ne:ne_10m_admin_0_countries@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf',
//     maxZoom: 14,
//   }),
// });

// mapbox vector
const layer = new MapboxVectorLayer({
  styleUrl: 'https://api.maptiler.com/maps/bright/style.json?key=lirfd6Fegsjkvs0lshxe'
})

function mapSetup() {
  const source = new VectorSource()
  const features = []
  falseCsvData.forEach(item => {
    if (item.DTJD && item.DTWD) {
      const coords = fromLonLat([item.DTJD, item.DTWD])
      if (!Number.isNaN(coords[0]) && !Number.isNaN(coords[1])) {
        features.push(new Feature({
          name: item.name,
          geometry: new Point(coords)
        }))
      }
    }
  })
  source.addFeatures(features)
  const meteorites = new VectorLayer({
    source
  })
  map.addLayer(meteorites)
}

function RenderingPoints() {
  const source = new VectorSource()
  const features = []
  falseCsvData.forEach(item => {
    if (item.DTJD && item.DTWD) {
      const coords = fromLonLat([item.DTJD, item.DTWD])
      if (!Number.isNaN(coords[0]) && !Number.isNaN(coords[1])) {
        features.push(new Feature({
          name: item.TS,
          geometry: new Point(coords)
        }))
      }
    }
  })
  source.addFeatures(features)
  const meteorites = new WebGLPointLayer({
    source,
    style: {
      symbol: {
        symbolType: 'circle',
        size: ['+', ['*', ['clamp', ['*', ['get', 'name'], 1 / 100], 0, 1], 18], 8],
        color: 'rgb(255, 0, 0)',
        opacity: 0.5
      }
    }
  })
  map.addLayer(meteorites)
}

function renderSeaLevel() {
  const elevation = [
    '+',
    -10000,
    [
      '*',
      0.1 * 255,
      [
        '+',
        ['*', 256 * 256, ['band', 1]],
        ['+', ['*', 256, ['band', 2]], ['band', 3]]
      ]
    ]
  ]
  const layer = new TileLayer({
    opacity: 0.6,
    source: new XYZ({
      url: '',
      maxZoom: 10,
      tileSize: 512,
      crossOrigin: 'anonymous'
    })
  })
}
function changeLevelFromSea() {
  const elevation = [
    '+',
    -10000,
    [
      '*',
      0.1 * 255,
      [
        '+',
        ['*', 256 * 256, ['band', 1]],
        ['+', ['*', 256, ['band', 2]], ['band', 3]],
      ],
    ],
  ]
  const layer = new WebGLTileLayer({
    opacity: 0.6,
    source: new XYZ({
      url:
        'https://api.maptiler.com/tiles/terrain-rgb/{z}/{x}/{y}.png?key=get_your_own_D6rA4zTHduk6KOKTXzGB',
      maxZoom: 10,
      tileSize: 512,
      crossOrigin: 'anonymous',
    }),
    style: {
      variables: {
        level: 0,
      },
      color: [
        'case',
        // use the `level` style variable to determine the color
        ['<=', elevation, ['var', 'level']],
        [139, 212, 255, 1],
        [139, 212, 255, 0],
      ],
    },
  })
  return layer
}

export default function OLTest() {
  let [currentArea, setCurrentArea] = useState(0)
  let [level, setLevel] = useState(1)
  let seaLayer = changeLevelFromSea()
  useEffect(() => {
    map = new Map({
      layers: [
        new TileLayer({
          // source: new XYZ({
          //   url: 'https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=get_your_own_D6rA4zTHduk6KOKTXzGB',
          //   tileSize: 512,
          //   maxZoom: 22,
          // }),
          
          source: new OSM(),
        }),
        seaLayer
      ],
      view:
        // 渲染高德地图
        // new TileLayer({
        //   source: new XYZ({
        //     projection: 'EPSG:3857',
        //     crossOrigin: 'anonymous', //跨域
        //     url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}',
        //     tileSize: 512,
        //   })
        // }),

        // 渲染广东的geojson
        // new VectorLayer({
        //   source: new VectorSource({
        //     format: new GeoJSON(),
        //     url: '/src/pages/openlayer/guangdong.json',
        //   }),
        // }),
        // new View({
        //   center: fromLonLat([113.266859, 23.1331]),
        //   // center: getCenter(sourceExtent),
        //   // extent: sourceExtent,
        //   // center: [0, 0],
        //   zoom: 10
        // }),
        new View({
          center: fromLonLat([-122.3267, 37.8377]),
          zoom: 11,
        }),
      target: 'map'
    })

    // map.addInteraction(new Link())
    // map.addLayer(layer)
    // 将geojson文件拖动的容器内，可绘制该geojson内容
    // map.addInteraction(new DragAndDrop({
    //   source,
    //   formatConstructors: [GeoJSON]
    // }))

    // 可更改geojson的绘制，鼠标移入边界线会显示一点，鼠标按下拖动可更改绘制，在新绘制内容显示点时，alt + click可删除更的绘制内容
    // map.addInteraction(
    //   new Modify({
    //     source
    //   })
    // )

    // 在地图上绘制内容，type的值代码提示器显示的LinearRing和GeometryCollection不能设置，显示该类型非法
    // map.addInteraction(new Draw({
    //   type: 'Point',
    //   source
    // }))

    // 绘制点边界线吸附
    // map.addInteraction(new Snap({
    //   source
    // }))

    // 地理定位
    // navigator.geolocation.watchPosition(
    //   function (pos) {
    //     const coords = [pos.coords.longitude, pos.coords.latitude];
    //     const accuracy = circular(coords, pos.coords.accuracy);
    //     source.clear(true);
    //     source.addFeatures([
    //       new Feature(
    //         accuracy.transform('EPSG:4326', map.getView().getProjection())
    //       ),
    //       new Feature(new Point(fromLonLat(coords))),
    //     ]);
    //   },
    //   function (error) {
    //     // alert(`ERROR: ${error.message}`);
    //   },
    //   {
    //     enableHighAccuracy: true,
    //   }
    // );
    // doLocation(map)


    // interact with vector tile features
    // const source = new VectorSource()
    // new VectorLayer({
    //   map,
    //   source,
    //   style: new Style({
    //     stroke: new Stroke({
    //       color: 'red',
    //       width: 4
    //     })
    //   })
    // })
    // map.on('pointermove', function (event) {
    //   source.clear()
    //   map.forEachFeatureAtPixel(
    //     event.pixel,
    //     function (feature) {
    //       const geometry = feature.getGeometry()
    //       source.addFeature(new Feature(fromExtent(geometry?.getExtent())))
    //     }, {
    //     hitTolerance: 2
    //   }
    //   )
    // })

    // map setup
    // mapSetup()

    // rendering points
    // RenderingPoints()

    // animatingPoints()
  }, [])
  function animatingPoints() {
    const rangeArea: Array<number> = falseCsvData.filter(item => item.DTJD && item.DTWD).map(item => item.KCMJ).sort((a, b) => b - a)
    const minArea = rangeArea[rangeArea.length - 1]
    const maxArea = rangeArea[0]
    const span = maxArea - minArea
    const rate = span / 200
    const start = maxArea + rate
    const styleVariables = {
      currentArea: minArea
    }

    const period = 1000;
    const periodStart = ['/', ['var', 'currentArea'], period]
    const decay = [
      'interpolate',
      ['linear'],
      ['get', 'area'],
      periodStart,
      0,
      ['var', 'currentArea'],
      1
    ]

    const source = new VectorSource()
    const features = []
    falseCsvData.forEach(item => {
      if (item.DTJD && item.DTWD) {
        const coords = fromLonLat([item.DTJD, item.DTWD])
        if (!Number.isNaN(coords[0]) && !Number.isNaN(coords[1])) {
          features.push(new Feature({
            name: item.TS,
            area: item.KCMJ,
            geometry: new Point(coords)
          }))
        }
      }
    })
    source.addFeatures(features)
    const meteorites = new WebGLPointLayer({
      source,
      style: {
        variables: styleVariables,
        symbol: {
          symbolType: 'circle',
          size: ['*', decay, ['*', ['clamp', ['*', ['get', 'area'], 1 / 100], 0, 1], 18], 8],
          color: 'rgb(255, 0, 0)',
          opacity: ['*', 0.5, decay]
        }
      }
    })
    map.addLayer(meteorites)

    let elpased = 0;
    function render() {
      styleVariables.currentArea = Math.round(minArea + elpased)
      setCurrentArea(minArea + elpased)
      elpased += rate
      if (minArea + elpased > start) {
        elpased = 0
      }
      map.render();
      requestAnimationFrame(render)
    }
    render()
  }

  return (
    <>
      <div id="map" style={{ width: '100%', height: '100%', backgroundColor: 'white' }}></div>
      <div className={base.tools}>
        <a onClick={clearSource}>clear</a>
        <a onClick={downloadData}>download</a>
      </div>
      <select id="visualiztionList" className={base['visualiztion-list']} onChange={changeVisualiztion}>
        {visualizations.map(item => {
          return <option key={item.name}>{item.name}</option>
        })}
      </select>
      <select id="visualiztionImageList" className={base['visualiztion-image-list']} onChange={changeVisualiztion}>
        {images.map(item => {
          return <option key={item.name}>{item.name}</option>
        })}
      </select>
      <div className={base['current-area']}>{currentArea}</div>
      <label id="silder" className={base.silder}>
        sea level
        <input id="level" type="range" min="0" max="100" value={level} onChange={(event) => {
          let newLevel = parseInt(event.target.value)
          console.log('show datainfo', newLevel)
          setLevel(event.target.value)
          seaLayer.updateStyleVariables({ level: newLevel })
        }} />
        +<span id="output">{level}</span>m
      </label>
    </>
  )
}