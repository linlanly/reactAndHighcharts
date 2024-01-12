import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Component } from 'react';
import { getLinearGradient, getRgba} from "./common.ts"

import TooltipElement from "./tooltip.tsx";
let colorList: Array<any> = [
  ['rgb(252, 191, 181)', 'rgb(173, 69, 51)', 'rgb(94, 38, 28)'],
  ['#f7ce9f', '#ee9b3b', '#6b4e2c'],
  ['#cd92fa', '#9d2af5', '#52088a'],
  ['#9d8bfa', '#6446fa', '#1d068f'],
  ['#6e82e7', '#1438eb', '#06197c'],
  ['rgb(243, 243, 91)', 'rgb(180, 180, 34)', 'rgb(133, 133, 18)'],
  ['rgb(75, 218, 75)', 'rgb(26, 160, 26)', 'rgb(10, 85, 10)'],
  ['rgb(190, 188, 188)', 'rgb(155, 154, 154)', 'rgb(104, 103, 103)']].map(item => getLinearGradient(item))
  
/**
 * 向highcharts的SVG添加x轴渐变样式
 * @param containerDoc series对应的元素
 */
function addLinearGradientForXAxis(containerDoc: Element) {
  let linearGradient = document.createElementNS(containerDoc.namespaceURI, 'linearGradient')
  linearGradient.setAttribute('id', 'linearGradient1')
  linearGradient.setAttribute('x1', '0')
  linearGradient.setAttribute('y1', '0')
  linearGradient.setAttribute('x2', '0')
  linearGradient.setAttribute('y2', '1')
  createStopElement(linearGradient, 0, '#3786CA', 0.05)
  createStopElement(linearGradient, 0.45, '#3786CA', 1)
  createStopElement(linearGradient, 0.55, '#3786CA', 1)
  createStopElement(linearGradient, 1, '#3786CA', 0.05)
  containerDoc.append(linearGradient)
}

/**
 * 调整x轴线样式
 * @param container load函数中的this
 */
function adjustStyleOfXAxis(container: any) {
  let linePosition = document.getElementsByClassName('highcharts-axis highcharts-xaxis')
  if (linePosition) {
    linePosition = linePosition[0].getElementsByClassName('highcharts-axis-line')
    if (linePosition) {
      let points = container.axes[0].axisLine.pathArray
      let positions = [[points[0][1] - 4, points[0][2]], [points[0][1], points[0][2]], [points[1][1], points[1][2]], [points[1][1] - 4, points[1][2]]]
      let str = ''
      positions.forEach((item, index) => {
        str += `${index ? 'L' : 'M'} ${item.join(' ')}`
      })
      str += ' Z'
      linePosition[0].setAttribute('d', str)
      linePosition[0].setAttribute('stroke-width', '0')
      linePosition[0].setAttribute('fill', 'url(#linearGradient1)')
    }
  }
}

/**
 * 调整柱子的样式
 * @param container load函数中的this
 * @param containerDoc series对应的元素
 */
function adjustStyleOfBar(container: any, containerDoc: Element) {
  let boxLength = 0, triangleLength = 3, spliceBottom = 0.5
  container.series[0].data.forEach((data: any, index: number) => {
    let width = data.graphic.width
    if (index === 0) {
      spliceBottom *= container.axes[1].width / 100
      boxLength = container.axes[1].width - spliceBottom
    }

    let color = data.color.stops
    let rightBotoom = [data.graphic.x, triangleLength]
    let right = [data.graphic.x + width / 2, 0]
    let rightLeft = [right[0], 2 * triangleLength]
    let rightTop = [data.graphic.x + width, triangleLength]
    let leftTop = [rightTop[0], boxLength - triangleLength]
    let left = [leftTop[0] - width / 2, boxLength]
    let leftBottom = [left[0] - width / 2, boxLength - triangleLength]

    let path = document.createElementNS(containerDoc.namespaceURI, 'path')
    path.setAttribute('d', `M ${left.join(' ')} L ${leftTop.join(' ')} L ${rightTop.join(' ')} L ${right.join(' ')}
      L ${rightBotoom.join(' ')} L ${leftBottom.join(' ')} Z`)
    path.setAttribute('stroke', color[1][1])
    path.setAttribute('stroke-width', '2')
    path.setAttribute('fill', getRgba(color[2][1], 0.5))
    path.classList.add('line-content')
    containerDoc.append(path)
    path.setAttribute('data-name', data.name)
    path.setAttribute('data-value', (data.y || 0) + '')
    path.setAttribute('data-color', color[1][1])

    path = document.createElementNS(containerDoc.namespaceURI, 'path')
    path.setAttribute('d', `M ${left.join(' ')} L ${rightLeft.join(' ')} L ${rightTop.join(' ')} L ${rightLeft.join(' ')} L ${rightBotoom.join(' ')}`)
    path.setAttribute('stroke', color[1][1])
    path.setAttribute('stroke-width', '2')
    path.setAttribute('fill', 'none')
    path.classList.add('line-content')
    containerDoc.append(path)

    let boxRightBottom = [data.graphic.x, data.graphic.y - triangleLength]
    let boxRightTop = [data.graphic.x + width, data.graphic.y - triangleLength]

    data.graphic?.element.setAttribute('d', `M ${boxRightBottom.join(' ')} L ${boxRightTop.join(' ')} L ${leftTop.join(' ')} L ${left.join(' ')} L ${leftBottom.join(' ')} Z`)
    data.graphic?.element.setAttribute('stroke-width', `0`)
  })
}

/**
 * 为SVG渐变色添加步骤颜色
 * @param doc 渐变色对应的元素
 * @param stop 步骤
 * @param color 颜色
 * @param opacity 透明度
 */
function createStopElement(doc: Element, stop: number, color: string, opacity: number) {
  let lineStop = document.createElementNS(doc.namespaceURI, 'stop')
  lineStop.setAttribute('offset', stop + '')
  lineStop.setAttribute('stop-color', color)
  lineStop.setAttribute('stop-opacity', opacity + '')
  doc.append(lineStop)
}

export default class stereoBarChart extends Component {
  constructor(props: any) {
    super(props);
    let _self = this
    this.state = {
      tooltipData: {
        point: [0, 0],
        name: '',
        display: 'none',
        value: 122,
        color: ''
      },
      options: {
        chart: {
          events: {
            load: function () {
              let container = this as any
              _self.setState({
                tooltipData: {
                  ..._self.state.tooltipData,
                  parentInfo: container.containerBox
                }
              })
              let containerDocs = document.getElementsByClassName('highcharts-series highcharts-series-0')
              let containerDoc = containerDocs ? containerDocs[0] : null
              if (containerDoc) {
                addLinearGradientForXAxis(containerDoc)
                containerDoc.addEventListener('mousemove', _self.showTooltip)
                containerDoc.addEventListener('mouseout', _self.hiddenTooltip)
                adjustStyleOfXAxis(this)
                adjustStyleOfBar(this, containerDoc)
              }
            },
            redraw: function () {
              let container = this as any
              _self.setState({
                tooltipData: {
                  ..._self.state.tooltipData,
                  parentInfo: container.containerBox
                }
              })
              let containerDocs = document.getElementsByClassName('highcharts-series highcharts-series-0')
              let containerDoc = containerDocs ? containerDocs[0] : null
              if (containerDoc) {
                // 先移除之前添加的壳子元素
                let paths: HTMLCollectionOf<Element> | null = containerDoc.getElementsByClassName('line-content')
                let containerElm = containerDoc as Element
                if (paths) {
                  Array.from(paths).forEach(item => {
                    containerElm.removeChild(item)
                  })
                  paths = null
                }

                adjustStyleOfXAxis(this)
                adjustStyleOfBar(this, containerDoc)
              }
            }
          },
          backgroundColor: '#02103A'
        },
        credits: {
          enabled: false//不显示LOGO
        },
        title: {
          text: ''
        },
        colors: colorList,
        yAxis: {
          min: 0,
          gridLineWidth: 0,
          title: {
            text: ''
          },
          labels: {
            useHTML: true,
            formatter: function () {
              let _self = this as any
              if (_self.isFirst) {
                return ''
              } else {
                return `<div style="display: flex;align-items: center;flex-direction: column;">
                  <div style="background-color: #55E9F3;border-radius: 50%;width: 6px; height: 6px;margin-top: -10px;margin-bottom: 5px;"></div>
                ${_self.value}<div>`
              }
            },
            style: {
              color: '#70788F'
            }
          }
        },
        xAxis: {
          labels: {
            style: {
              fontSize: '14px',
              color: '#70788F'
            }
          },
          lineWidth: 4,
          type: 'category'
        },
        tooltip: {
          valueSuffix: ' m'
        },
        series: [{
          name: 'Height',
          type: 'bar',
          colorByPoint: true,
          borderRadius: 0,
          showInLegend: false,
          data: [
            {
              name: 'Pyramid of Khufu',
              y: 138.8
            },
            {
              name: 'Pyramid of Khafre',
              y: 136.4
            },
            {
              name: 'Red Pyramid',
              y: 104
            },
            {
              name: 'Bent Pyramid',
              y: 101.1
            },
            {
              name: 'Pyramid of the Sun',
              y: 75
            }
          ]
        }]
      }
    }
    this.hiddenTooltip = this.hiddenTooltip.bind(this)
    this.showTooltip = this.showTooltip.bind(this)
  }
  showTooltip(event: Event) {
    let mouseEvent = event as MouseEvent
    let targetDoc = event.target
    let targetEle = targetDoc as Element
    if (targetDoc && ['line-content'].includes(targetEle.classList[0]) && targetEle.getAttribute('data-name')) {
      let name = targetEle.getAttribute('data-name') || '', color = targetEle.getAttribute('data-color') || '', value = targetEle.getAttribute('data-value') || ''
      let position = [mouseEvent.offsetX || 0, mouseEvent.offsetY || 0]
      this.setState({
        tooltipData: {
          ...this.state.tooltipData,
          name,
          display: 'block',
          value,
          color,
          point: position
        }
      })
    }
  }
  hiddenTooltip() {
    this.setState({
      tooltipData: {
        ...this.state.tooltipData,
        display: 'none',
      }
    })
  }
  componentWillUnmount() {
    let containerDocs = document.getElementsByClassName('highcharts-series highcharts-series-0')
    let containerDoc = containerDocs ? containerDocs[0] : null
    if (containerDoc) {
      containerDoc.removeEventListener('mousemove', this.showTooltip)
      containerDoc.removeEventListener('mouseout', this.hiddenTooltip)
    }
  }
  render() {
    return (

      <div style={{ position: 'relative' }}>
        <HighchartsReact
          highcharts={Highcharts}
          options={this.state.options}
          {...Highcharts.Props}
        />
        <TooltipElement tooltipData={this.state.tooltipData} />
      </div>
    )
  }
}
