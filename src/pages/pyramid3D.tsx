import Highcharts from 'highcharts';
import { LinearGradientColorObject } from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Funnel from 'highcharts/modules/funnel';
Funnel(Highcharts)
interface linear {
  x1: number,
  x2: number,
  y1: number,
  y2: number
}
interface LinearGradient {
  linearGradient: linear,
  stops: Array<Array<number | string>>
}
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
/**
 * 将颜色转为rgba格式
 * @param color 颜色
 * @param transparency 透明度
 * @returns
 */
function getRgba(color: string, transparency: number): string {
  if (!color) {
    return ''
  }
  if (color.startsWith('rgba')) {
    let colorStr = color.split(',')
    colorStr[colorStr.length - 1] = transparency + ')'
    return colorStr.join(',')
  }
  else if (color.startsWith('rgb(')) {
    let colorStr = color.split(')')
    colorStr[1] = transparency + ')'
    return colorStr.join(',')
  } else if (color.startsWith('#')) {
    let colorStr = color.split('#')[1]
    let arr = [parseInt(colorStr.substring(0, 2), 16), parseInt(colorStr.substring(2, 4), 16), parseInt(colorStr.substring(4, 6), 16)]
    return `rgba(${arr.join(',')}, ${transparency})`
  }
  return ''
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
/**
 * 绘制平面
 * @param points 点的数组
 * @param color 填充颜色
 * @param containerDoc 将平面绘制进的容器
 * @param positoinDoc 平面绘制后的元素
 */
function drawPlane(points: Array<Array<number>>, color: string, containerDoc: Element, positoinDoc: Element) {
  let str = ''
  points.forEach((item, index) => {
    str += (index ? ' L ' : 'M ') + item.join(' ')
  })
  str += ' Z'
  let path = document.createElementNS(containerDoc.namespaceURI, 'path')
  path.setAttribute('d', str)
  path.setAttribute('fill', color)
  path.classList.add('pyramid-extend')
  containerDoc.insertBefore(path, positoinDoc)
}

function assemblePyramid(container: any, pyramidSize: sizeObj, containerDoc: Element) {
  let startLeft: Array<number> = [], startRight: Array<number> = []
  let angle = 45, splitHeight = 10, valueHeight = 0

  let elementWidth = pyramidSize.width
  let elementHeight = pyramidSize.height
  let radian = Math.atan(elementWidth / 2 / elementHeight)
  let secondRadian = angle * Math.PI / 180

  // 计算数值为1时对应的高度
  valueHeight = (elementHeight - (container.series[0].data.length - 1) * splitHeight) / container.series[0].total
  container.series[0].data.forEach((item: any, index: number) => {
    let points = container.series[0].data[0].graphic.pathArray
    if (index === 0) {
      startLeft = [points[0][1], points[0][2]]
      startRight = [points[1][1], points[1][2]]
    }

    let color = item.color.stops[2][1]
    let bottomLeftBottom = [...startLeft], bottomRightBottom = [...startRight]
    let height = item.y * valueHeight
    let moveX = Math.abs(height * Math.tan(radian))
    let topLeftBottom = [startLeft[0] + moveX, startLeft[1] - height], topRightBottom = [startRight[0] - moveX, startRight[1] - height]
    item.graphic.element.setAttribute('d', `M ${startLeft.join(' ')} L ${startRight.join(' ')} L ${topRightBottom.join(' ')} L ${topLeftBottom.join(' ')} Z`) // 绘制正面
    item.graphic.element.setAttribute('fill', item.color)

    let sideX = Math.abs(elementWidth * Math.sin(secondRadian)), sideY = Math.abs(elementWidth * Math.cos(secondRadian))
    let bottomLeftTop = [startLeft[0] + sideX, startLeft[1] - sideY], bottomRightTop = [startRight[0] + sideX, startRight[1] - sideY]
    drawPlane([startLeft, startRight, bottomRightTop, bottomLeftTop], color, containerDoc, item.graphic.element)

    let secondX = Math.abs(splitHeight * Math.tan(radian))
    startLeft = [topLeftBottom[0] + secondX, topLeftBottom[1] - splitHeight]
    startRight = [topRightBottom[0] - secondX, topRightBottom[1] - splitHeight]
    elementWidth -= 2 * moveX

    let topX = Math.abs(elementWidth * Math.sin(secondRadian)), topY = Math.abs(elementWidth * Math.cos(secondRadian))
    let topLeftTop = [topLeftBottom[0] + topX, topLeftBottom[1] - topY], topRightTop = [topRightBottom[0] + topX, topRightBottom[1] - topY]

    drawPlane([bottomLeftBottom, bottomLeftTop, topLeftTop, topLeftBottom], color, containerDoc, item.graphic.element)
    drawPlane([bottomRightBottom, bottomRightTop, topRightTop, topRightBottom], color, containerDoc, item.graphic.element)
    drawPlane([bottomLeftTop, bottomRightTop, topRightTop, topLeftTop], color, containerDoc, item.graphic.element)
    drawPlane([topLeftBottom, topRightBottom, topRightTop, topLeftTop], item.color.stops[1][1], containerDoc, item.graphic.element)
    elementWidth -= 2 * secondX
  })
}
const options: Highcharts.Options = {
  chart: {
    type: 'pyramid',
    marginRight: 100,
    events: {
      load: function () {
        let containerDocs = document.getElementsByClassName('highcharts-series highcharts-series-0')
        let containerDoc = containerDocs[0] || null
        let elementInfo = this.seriesGroup.element.getBoundingClientRect()
        let containerInfo = this.container.getBoundingClientRect()
        // 选择金字塔使之一边垂直，看起来更好看
        rotatePyramid(this, containerInfo, elementInfo)
        assemblePyramid(this, elementInfo, containerDoc)
      },
      redraw: function () {
        let containerDocs = document.getElementsByClassName('highcharts-series highcharts-series-0')
        let containerDoc = containerDocs[0] || null
        let paths: HTMLCollectionOf<Element> | null = containerDoc.getElementsByClassName('pyramid-extend')
        if (paths) {
          Array.from(paths).forEach(item => {
            containerDoc.removeChild(item)
          })
          paths = null
        }
        
				let transform = this.series[0].group.element.getAttribute('transform')
				let translate = transform.match(/translate\((\d+),(\d+)\)/)[0]
				translate = translate.replace(/(\d+)/g, `$1px`)
				this.series[0].group.element.style.transform = `rotateZ(0deg)` + translate;
        
        let elementInfo = this.seriesGroup.element.getBoundingClientRect()
        let containerInfo = this.container.getBoundingClientRect()
        rotatePyramid(this, containerInfo, elementInfo)
        assemblePyramid(this, elementInfo, containerDoc)
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
