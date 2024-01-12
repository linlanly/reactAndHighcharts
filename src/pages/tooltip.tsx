import tooltipStyle from "./tooltip.module.scss"
import { tooltipObj } from "./common.ts"
import { Component } from 'react';
type tooltipType = typeof tooltipObj

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

export default class TooltipElement extends Component {
  constructor(props: tooltipType) {
    super(props);
    this.state = {
      position: [0, 0],
      fontSize: 16
    }
  }

  componentDidUpdate(preProps: tooltipType) {
    if (preProps !== this.props) {
      this.dealPosition()
    }
  }
  /**
   * 调整tooltip的位置，容器出现滚动条
   */
  dealPosition() {
    let tooltipData = this.props.tooltipData
    let position = tooltipData.point
    let fontSize = this.state.fontSize
    if (!Array.isArray(position) || position.length < 2) {
      return
    }
    let textWidth = [getTextPixelLength(tooltipData.name, fontSize), getTextPixelLength(tooltipData.value, fontSize) + 13]
    let parentInfo = tooltipData.parentInfo
    let selfInfo = {
      width: Math.max(...textWidth) + 20,
      height: 20 + 2 * fontSize * 1.5
    }

    let point = [0, 0]
    if (position[0] + selfInfo.width + 10 > parentInfo.width) {
      point[0] = parentInfo.width - selfInfo.width - 20
    } else {
      point[0] = position[0] + 10
    }
    if (position[1] + selfInfo.height + 10 > parentInfo.height) {
      point[1] = parentInfo.height - selfInfo.height - 20
    } else {
      point[1] = position[1] + 10
    }
    this.setState({
      position: point
    })
  }

  render() {
    return (
      <div className={tooltipStyle.tooltip_doc} style={{
        display: this.props.tooltipData.display,
        left: this.state.position[0] + 'px',
        top: this.state.position[1] + 'px'
      }}>
        <div className={tooltipStyle.name}>
          {this.props.tooltipData
            .name}
        </div>
        <div className={tooltipStyle.value_box}>
          <span className={tooltipStyle.color} style={{
            backgroundColor: this.props.tooltipData
              .color
          }}></span>
          <span className={tooltipStyle.value}>
            {this.props.tooltipData
              .value}
          </span>
        </div>
      </div>
    )
  }
}