
export interface tooltipObj {
  point: Array<number>,
  name: string,
  value: string,
  color: string,
  display: string
}


/**
 * 获取线性渐变色
 * @param colorList 颜色数组
 * @returns 线性渐变色
 */
 export function getLinearGradient(colorList: Array<string>) {
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
export function getRgba(color: string, transparency: number): string {
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