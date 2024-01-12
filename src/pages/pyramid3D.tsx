import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Funnel from 'highcharts/modules/funnel';
Funnel(Highcharts)
/**
 * 获取线性渐变色
 * @param colorList 颜色数组
 * @returns 线性渐变色
 */
function getLinearGradient(colorList: Array<string>) {
  return {
    linearGradient: {
      x1: 0,
      x2: 0.2,
      y1: 0,
      y2: 1
    },
    stops: [
      [0, colorList[0]],
      [0.7, colorList[1]],
      [1, colorList[2]]
    ]
  }
}
let colorList: Array<any> = [
  ['rgb(236, 80, 53)', 'rgb(160, 49, 30)', 'rgb(109, 35, 22)'],
  ['#FDB461', '#F09D5D', '#D47056'],
  ['#BB65FE', '#9B45DF', '#651C9D'],
  ['#846CFC', '#6E54EC', '#3B1EC7'],
  ['#3453E7', '#2745D6', '#203491'],
  ['rgb(243, 243, 91)', 'rgb(180, 180, 34)', 'rgb(133, 133, 18)'],
  ['rgb(75, 218, 75)', 'rgb(26, 160, 26)', 'rgb(10, 85, 10)'],
  ['rgb(190, 188, 188)', 'rgb(155, 154, 154)', 'rgb(104, 103, 103)']].map(item => getLinearGradient(item))
interface dataObj {
  name: string,
  y: number,
  events?: any,
  dataLabels?: any,
  direction?: string
}
let dataList: Array<dataObj> = [
  { name: '苹果', y: 4654 },
  { name: '芒果', y: 3064 },
  { name: '火龙果', y: 1987 },
  { name: '人参果', y: 976 },
  { name: '奇异果', y: 846 },
  { name: '牛油果', y: 464 },
]
interface sizeObj {
  width: number,
  height: number,
  x: number,
  y: number
}
/**
 * 设置金字塔的旋转点，按一定角度旋转金字塔
 * @param container load函数中的this
 */
function rotatePyramid(container: any, parentSize: sizeObj, pyramidSize: sizeObj) {
  let elementWidth = pyramidSize.width
  let elementHeight = pyramidSize.height
  let radian = Math.atan(elementWidth / 2 / elementHeight)
  let rotateAngle = radian * 180 / Math.PI
  let positionX = pyramidSize.x - parentSize.x + pyramidSize.width / 2
  let positionY = pyramidSize.y - parentSize.y
  container.series[0].group.element.style.transformOrigin = `${positionX}px ${positionY}px`
  let transform = container.series[0].group.element.getAttribute('transform')
  let translate = transform.match(/translate\((\d+),(\d+)\)/)[0]
  translate = translate.replace(/(\d+)/g, `$1px`)
  container.series[0].group.element.style.transform = `rotateZ(${rotateAngle}deg) ` + translate
}
interface extendData {
  name: string,
  y: number
}
/**
 * 绘制平面
 * @param points 点的数组
 * @param color 填充颜色
 * @param containerDoc 将平面绘制进的容器
 * @param positoinDoc 平面绘制后的元素
 */
function drawPlane(points: Array<Array<number>>, color: string, containerDoc: Element, positoinDoc: Element, data?: extendData) {
  let str = ''
  points.forEach((item, index) => {
    str += (index ? ' L ' : 'M ') + item.join(' ')
  })
  str += ' Z'
  let path = document.createElementNS(containerDoc.namespaceURI, 'path')
  path.setAttribute('d', str)
  path.setAttribute('fill', color)
  path.classList.add('pyramid-extend')
  if (data) {
    path.setAttribute('data-name', data.name)
    path.setAttribute('data-value', data.y + '')
    path.setAttribute('data-color', color)
  }
  containerDoc.insertBefore(path, positoinDoc)
}
/**
 * 
 * @param container load函数中的this
 * @param pyramidSize 金字塔的getBoundingClientRect信息
 * @param containerDoc 容器对应的element
 */
function assemblePyramid(container: any, pyramidSize: sizeObj, containerDoc: Element) {
  let elementHeight = pyramidSize.height // 金字塔总高度
  let elementWidth = pyramidSize.width
  let splitHeight = 10 // 每层之间的间隔高度
  // 计算数值为1时对应的高度
  let valueHeight = (elementHeight - (container.series[0].data.length - 1) * splitHeight) / container.series[0].total

  let radian = Math.atan(elementWidth / 2 / elementHeight)
  let bottomLeftBottom: Array<number> = [], bottomRightBottom: Array<number> = []

  container.series[0].data.forEach((item: any, index: number) => {
    let points = item.graphic.pathArray
    if (index === 0) {
      bottomLeftBottom = [points[0][1], points[0][2]]
      bottomRightBottom = [points[1][1], points[1][2]]
    }
    let currentHeight = valueHeight * item.y
    let topX = Math.abs(currentHeight * Math.tan(radian))
    let topLeftBottom = [bottomLeftBottom[0] + topX, bottomLeftBottom[1] - currentHeight], topRightBottom = [bottomRightBottom[0] - topX, bottomRightBottom[1] - currentHeight]
    item.graphic.element.setAttribute('d', `M ${bottomLeftBottom.join(' ')} L ${bottomRightBottom.join(' ')} L ${topRightBottom.join(' ')} L ${topLeftBottom.join(' ')} Z`) // 绘制正面

    item.graphic.element.setAttribute('data-name', item.name)
    item.graphic.element.setAttribute('data-value', (item.y || 0) + '')
    item.graphic.element.setAttribute('data-color', item.color.stops[1][1])

    // 获取右侧线中点位置
    let labelCenter = [(topRightBottom[0] + bottomRightBottom[0]) / 2, (topRightBottom[1] + bottomRightBottom[1]) / 2]
    let pathArr = item.dataLabel.connector.pathArray // 牵引线绘制信息
    let splitWidth = pathArr[2][1] - pathArr[1][1] // 靠近金字塔的点到下一个点的距离
    pathArr[1][1] = labelCenter[0] - splitWidth
    pathArr[1][2] = labelCenter[1]
    pathArr[2][1] = labelCenter[0]
    pathArr[2][2] = labelCenter[1]
    item.dataLabel.connector.element.setAttribute('d', pathArr.reduce((a: string, b: Array<Array<string | number>>) => a + b.join(' '), ''))

    let angle = 45
    let angleRadian = angle * Math.PI / 180
    let baseColor = item.color.stops[2][1], lightColor = item.color.stops[1][1]
    let bottomX = Math.abs(elementWidth * Math.cos(angleRadian)), bottomY = Math.abs(elementWidth * Math.sin(angleRadian))
    let bottomLeftTop = [bottomLeftBottom[0] + bottomX, bottomLeftBottom[1] - bottomY], bottomRightTop = [bottomRightBottom[0] + bottomX, bottomRightBottom[1] - bottomY]
    drawPlane([bottomLeftBottom, bottomRightBottom, bottomRightTop, bottomLeftTop], baseColor, containerDoc, item.graphic.element) // 底部

    elementWidth -= topX * 2
    let moveX = Math.abs(elementWidth * Math.cos(angleRadian)), moveY = Math.abs(elementWidth * Math.sin(angleRadian))
    let topLeftTop = [topLeftBottom[0] + moveX, topLeftBottom[1] - moveY], topRightTop = [topRightBottom[0] + moveX, topRightBottom[1] - moveY]
    drawPlane([bottomLeftBottom, bottomLeftTop, topLeftTop, topLeftBottom], baseColor, containerDoc, item.graphic.element) // 左侧
    drawPlane([bottomLeftTop, bottomRightTop, topRightTop, topLeftTop], baseColor, containerDoc, item.graphic.element) // 背面
    drawPlane([topLeftBottom, topRightBottom, topRightTop, topLeftTop], lightColor, containerDoc, item.graphic.element) // 顶部
    drawPlane([bottomRightBottom, bottomRightTop, topRightTop, topRightBottom], baseColor, containerDoc, item.graphic.element, {
      name: item.name,
      y: item.y
    }) // 右侧


    let nextX = Math.abs(splitHeight * Math.tan(radian))
    elementWidth -= nextX * 2
    bottomLeftBottom = [topLeftBottom[0] + nextX, topLeftBottom[1] - splitHeight]
    bottomRightBottom = [topRightBottom[0] - nextX, topRightBottom[1] - splitHeight]
  })
}/**
 * 调整tooltip的位置，防止展示不全
 * @param parentInfo highcharts容器的宽高
 * @param selfInfo tooltip元素的宽高
 * @param position 鼠标移动相对highcharts容器的位置
 * @returns tooltip的位置
 */
function dealPosition(parentInfo: widthInfo, selfInfo: widthInfo, position: Array<number>): Array<number> {
  let point = [0, 0]
  if (position[0] + selfInfo.width + 10 > parentInfo.width) {
    point[0] = parentInfo.width - selfInfo.width - 10
  } else {
    point[0] = position[0] + 10
  }
  if (position[1] + selfInfo.height + 10 > parentInfo.height) {
    point[1] = parentInfo.height - selfInfo.height - 10
  } else {
    point[1] = position[1] + 10
  }
  return point
}
interface widthInfo {
  width: number, height: number
}
/**
 * 生成或调整tooltip元素
 * @param name 当前移动金字塔层对应的名称
 * @param color 当前移动金字塔层对应的颜色
 * @param value 当前移动金字塔层对应的值
 * @param position 鼠标移动相对highcharts容器的位置
 */
function getToolipElement(name: string, color: string, value: string, position: Array<number>) {
  let containerDoc = document.getElementsByClassName('highcharts-container')
  if (containerDoc[0]) {
    let tooltipDocs = containerDoc[0].getElementsByClassName('tooltip-doc')
    let tooltipDoc = tooltipDocs ? tooltipDocs[0] : null
    let tooltipEle = tooltipDoc as HTMLElement
    if (tooltipEle) {
      if (!name) {
        tooltipEle.style.display = 'none'
        return
      } else {
        tooltipEle.style.display = 'block'
      }
      let nameDoc = tooltipEle.getElementsByClassName('name')
      if (nameDoc) {
        nameDoc[0].innerHTML = name
      }
      let valueDoc = tooltipEle.getElementsByClassName('value')
      if (valueDoc) {
        valueDoc[0].innerHTML = value
      }
      let colorDoc = tooltipEle.getElementsByClassName('color')
      if (colorDoc) {
        let colorEle = colorDoc[0] as HTMLElement
        colorEle.style.backgroundColor = color
      }
    } else {
      tooltipEle = document.createElement('div')
      tooltipEle.className = 'tooltip-doc'
      let str = `<div class="name">${name}</div>
      <div class="value-box"><span class="color"></span><span class="value">${value}</span></div>`
      tooltipEle.innerHTML = str
      containerDoc[0].append(tooltipEle)
    }
    let containerDocBound = containerDoc[0].getBoundingClientRect()
    let parentInfo: widthInfo = {
      width: containerDocBound.width,
      height: containerDocBound.height
    }
    let currentBound = tooltipEle.getBoundingClientRect()
    let currentInfo: widthInfo = {
      width: currentBound.width,
      height: currentBound.height
    }
    let point = dealPosition(parentInfo, currentInfo, position)
    tooltipEle.style.left = point[0] + 'px'
    tooltipEle.style.top = point[1] + 'px'
  }
}
/**
 * 为鼠标在金字塔层移动展示tooltip，鼠标移出隐藏tooltip
 * @param containerDoc 监听鼠标操作的容器
 */
function addEventListenerForTooltip(containerDoc: Element) {
  containerDoc.addEventListener('mousemove', (event) => {
    let mouseEvent = event as MouseEvent
    let targetDoc = event.target
    let targetEle = targetDoc as Element
    let name = targetEle.getAttribute('data-name') || '', color = targetEle.getAttribute('data-color') || '', value = targetEle.getAttribute('data-value') || ''
    let position = [mouseEvent.offsetX || 0, mouseEvent.offsetY || 0]
    getToolipElement(name, color, value, position) // 添加或修改tooltip
  })
  containerDoc.addEventListener('mouseout', () => {
    let containerDoc = document.getElementsByClassName('highcharts-container')
    if (containerDoc[0]) {
      let tooltipDocs = containerDoc[0].getElementsByClassName('tooltip-doc')
      let tooltipDoc = tooltipDocs ? tooltipDocs[0] : null
      if (tooltipDoc) {
        let tooltipEle = tooltipDoc as HTMLElement
        tooltipEle.style.display = 'none'
      }
    }
  })
}
const options: any = {
  tooltip: {
    enabled: false
  },
  chart: {
    type: 'pyramid',
    marginRight: 100,
    events: {
      load: function () {
        let container = this as any
        let containerDocs = document.getElementsByClassName('highcharts-series highcharts-series-0')
        let containerDoc = containerDocs[0] || null
        if (containerDoc) {
          addEventListenerForTooltip(containerDoc)
          let elementInfo = container.seriesGroup.element.getBoundingClientRect()
          let parentInfo = container.container.getBoundingClientRect()
          rotatePyramid(container, parentInfo, elementInfo)
          assemblePyramid(container, elementInfo, containerDoc)
        }
      },
      redraw: function () {
        let container = this as any
        let transform = container.series[0].group.element.getAttribute('transform')
        let translate = transform.match(/translate\((\d+),(\d+)\)/)[0]
        translate = translate.replace(/(\d+)/g, `$1px`)
        container.series[0].group.element.style.transform = `rotateZ(0deg)` + translate;

        let containerDocs = document.getElementsByClassName('highcharts-series highcharts-series-0')
        let containerDoc = containerDocs ? containerDocs[0] : null
        if (containerDoc) {
          // 先移除之前添加的壳子元素
          let paths: HTMLCollectionOf<Element> | null = containerDoc.getElementsByClassName('pyramid-extend')
          let containerElm = containerDoc as Element
          if (paths) {
            Array.from(paths).forEach(item => {
              containerElm.removeChild(item)
            })
            paths = null
          }
          let elementInfo = container.seriesGroup.element.getBoundingClientRect()
          let parentInfo = container.container.getBoundingClientRect()

          rotatePyramid(container, parentInfo, elementInfo) // 调整金字塔角度
          assemblePyramid(container, elementInfo, containerDoc) // 调整金字塔绘制
        }
      }
    },
    backgroundColor: 'black'
  },
  title: {
    text: '',
    x: -50
  },
  plotOptions: {
    pyramid: {
      width: '20%',
      height: '65%',
      borderColor: 'black',
      borderWidth: 0,
      center: ['35%', '45%']
    },
    series: {
      states: {
        hover: { // 禁止鼠标移入，模块添加高亮
          enabled: false
        },
        inactive: { // 禁止鼠标移入，模块灰暗
          enabled: false
        }
      },
      dataLabels: {
        enabled: true,
        color: 'white',
      }
    }
  },
  legend: {
    enabled: false
  },
  series: [{
    name: '水果',
    type: 'pyramid',
    dataLabels: {
      position: 'right'
    },
    colors: colorList,
    data: dataList
  }]
}
export default function OtherChart() {
  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={options}
      {...Highcharts.Props}
    />
  )
}
