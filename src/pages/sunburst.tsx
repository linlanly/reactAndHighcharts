import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import sunburst from 'highcharts/modules/sunburst';
sunburst(Highcharts);
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
  ['rgb(253, 127, 105)', 'rgb(202, 103, 86)', 'rgb(109, 35, 22)'],
  ['rgb(216, 215, 215)', 'rgb(170, 168, 168)', 'rgb(100, 99, 99)'],
  ['#ce90fd', '#955dc0', '#674383'],
  ['#846CFC', '#6E54EC', '#3B1EC7'],
  ['#3453E7', '#2745D6', '#203491'],
  ['rgb(243, 243, 91)', 'rgb(180, 180, 34)', 'rgb(133, 133, 18)'],
  ['rgb(75, 218, 75)', 'rgb(26, 160, 26)', 'rgb(10, 85, 10)'],
  ['rgb(190, 188, 188)', 'rgb(155, 154, 154)', 'rgb(104, 103, 103)']].map(item => getLinearGradient(item))
let dataList = [{
  'id': '1',
  'name': '水果',
  value: 300
}, {
  'id': '2',
  'name': '蔬菜',
  sliced: true,
  value: 50
}, {
  'id': '1.1',
  'parent': '1',
  'name': '热带水果',
  value: 230
}, {
  'id': '1.2',
  'parent': '1',
  'name': '普通水果',
  value: 70
}, {
  'id': '1.1.1',
  'parent': '1.1',
  'name': '芒果',
  value: 100
}, {
  'id': '1.1.2',
  'parent': '1.1',
  'name': '火龙果',
  value: 100
}, {
  'id': '1.1.3',
  'parent': '1.1',
  'name': '香蕉',
  value: 70,
  bulge: true,
  color: 'white'
}]
dataList.forEach((item, index) => {
  item.color = colorList[index]
})
getPercentage(dataList)
/**
 * 计算每一项在父级的占比
 * @param list 
 */
function getPercentage(list: Array<any>) {
  let parentList: Array<any> = []
  list.forEach(item => {
    if (item.parent) {
      let temp = parentList.find(citem => citem.id === item.parent)
      if (!temp) {
        parentList.push(item)
      }
    } else {
      let temp = parentList.find(citem => citem.id === '0')
      if (!temp) {
        parentList.push({
          id: '0',
          name: 'all',
          value: item.value
        })
      } else {
        temp.value += item.value
      }
    }
  })
  list.forEach(item => {
    let temp = parentList.find(citem => citem.id === item.parent || '0')
    if (temp) {
      item.percentage = item.value * 100 / temp.value
    }
  })
}
/**
 * @param text 文本  fontSize 字体大小
 * @returns 文本对应的长度
 */
function getTextPixelLength(text: string, fontSize: number): number {
  let length = 0
  Array.from(text).map(function (char) {
    // 字符编码大于255，说明是双字节字符
    if (char.charCodeAt(0) > 255) {
      length += 2;
    } else {
      length++;
    }
  });
  return fontSize / 2 * length
}
/**
 * @param text 文本  ellipsis 是否超出显示省略号  width: 文本框宽度  size: 字体大小
 * @returns 文本分行
 */
function addText(text: string, ellipsis: boolean, width: number, size: number): Array<string> {
  let textNum = Math.floor(width / size)
  let index = 0, endNum = textNum
  let strList = []
  while (true) {
    let textWidth = getTextPixelLength(text.substring(index, endNum), size)
    if (textWidth < width) {
      endNum++
    } else {
      endNum = textWidth === width ? endNum : endNum - 1
      if (ellipsis) {
        strList.push(text.substring(index, endNum - 1) + '...')
        break
      } else {
        strList.push(text.substring(index, endNum))
      }
      index = endNum
      endNum += textNum
    }
    if (endNum >= text.length) {
      strList.push(text.substring(index, endNum))
      break
    }
  }
  return strList
}
/**
 * 绘制label内容及其牵引线
 * @param container load函数中的this
 */
function drawLabels(container: any) {
  let containerDoc = document.getElementsByClassName('highcharts-series highcharts-series-0')
  let firstRadian = 0, circlePoint: Array<number> = []
  container.series[0].data.forEach((data:any, index: number) => {
    if (['香蕉'].includes(data.name)) {
      data.graphic.attr({
        r: data.graphic.r * 1.1
      })
    }
    let arcLength = data.outerArcLength // 图形外圆弧弧长
    let radian = (data.shapeExisting.end - data.shapeExisting.start) / 2 // 图形的弧度
    let arcRadius = arcLength / 2 / radian // 图形外圆弧到圆心的半径
    let radius = data.graphic.radius //图形内圆弧到外圆弧的距离
    let halfRadius = radius / 2
    let centerRadius = arcRadius - halfRadius
    let points = data.graphic.pathArray //图形绘制信息
    if (index === 0) {
      firstRadian = data.shapeExisting.start
      circlePoint = [points[3][6], points[3][7]]
    }
    let centerRadian = data.shapeExisting.start + radian
    let centerAngle = (centerRadian - firstRadian) * 180 / Math.PI
    if (data.sliced) {
      centerRadius += 15
    }
    let cx = centerRadius * Math.cos(centerRadian), cy = centerRadius * Math.sin(centerRadian)
    let startPoint = [circlePoint[0] + cx, circlePoint[1] + cy]

    let firstLine = 4 * radius - arcRadius
    let flx = firstLine * Math.cos(centerRadian), fly = firstLine * Math.sin(centerRadian)
    let firstLinePoint = [startPoint[0] + flx, startPoint[1] + fly]

    let secondLine = 30
    let secondLinePoint = [firstLinePoint[0], firstLinePoint[1]]

    let textWidth = 150, fontSize = 16 // svg未设置大小的字体，对应为16
    let textList = addText(data.name + '  （' + data.percentage?.toFixed(2) + '%）', true, textWidth, fontSize)
    let textPoint = [secondLinePoint[0], secondLinePoint[1] + 5] // 文本往下偏移，使第二条线对齐文本高度的一半
    if (centerAngle > 180) {
      secondLinePoint[0] -= secondLine
      // 根据文本大小，调整文本框对应的位置
      let width = textWidth
      if (textList.length === 1) {
        width = getTextPixelLength(textList[0], fontSize)
      }
      textPoint[0] -= secondLine + 10 + width
    } else {
      secondLinePoint[0] += secondLine
      textPoint[0] += secondLine + 10
    }
    let textDoc = document.createElementNS(containerDoc[0].namespaceURI, 'text')
    textDoc.setAttribute('x', textPoint[0] + '')
    textDoc.setAttribute('y', textPoint[1] + '')
    textList.forEach((item, index) => {
      let tspan = document.createElementNS(containerDoc[0].namespaceURI, 'tspan')
      tspan.innerHTML = item
      tspan.setAttribute('x', textPoint[0] + '')
      tspan.setAttribute('y', textPoint[1] + index * 20 + '')
      tspan.setAttribute('stroke', 'white')
      textDoc.append(tspan)
    })
    textDoc.classList.add('text-content')
    containerDoc[0].append(textDoc)

    let path = document.createElementNS(containerDoc[0].namespaceURI, 'path')
    path.setAttribute('d', `M ${startPoint.join(' ')} L ${firstLinePoint.join(' ')} L ${secondLinePoint.join(' ')}`)
    path.setAttribute('stroke', 'white')
    path.setAttribute('stroke-width', '2')
    path.setAttribute('fill', 'none')
    path.classList.add('line-content')
    containerDoc[0].append(path)
  })
}
const options: Highcharts.Options = {
  chart: {
    backgroundColor: 'rgba(0,0,0)',
    events: {
      load: function () {
        drawLabels(this)
      },
      redraw: function () {
        let containerDoc = document.getElementsByClassName('highcharts-series highcharts-series-0')
        let paths: HTMLCollectionOf<Element> | null = containerDoc[0].getElementsByClassName('line-content')
        if (paths) {
          Array.from(paths).forEach(item => {
            containerDoc[0].removeChild(item)
          })
          paths = null
        }
        let texts: HTMLCollectionOf<Element> | null = containerDoc[0].getElementsByClassName('text-content')
        if (texts) {
          Array.from(texts).forEach(item => {
            containerDoc[0].removeChild(item)
          })
          texts = null
        }
        drawLabels(this)
      }
    }
  },
  title: {
    text: undefined
  },
  credits: {
    enabled: false//不显示LOGO
  },
  plotOptions: {
    sunburst: {
      allowPointSelect: true,//每个扇块能否选中
      cursor: 'pointer',//鼠标指针
      center: ['38%', '50%'],
    },
    series: {
      dataLabels: {
        enabled: false
      },
    }
  },
  colors: colorList,
  series: [{
    type: "sunburst",
    data: dataList,
    size: '80%',
    cursor: 'pointer',
    borderColor: '#020725',
    borderWidth: 3,
  }],
  tooltip: {
    headerFormat: "",
    pointFormat: '<b>{point.name}</b>：<b>{point.value}</b>'
  }
}
export default function () {
  return (
    <>{
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        {...Highcharts.Props}
      />}
    </>
  )
}
