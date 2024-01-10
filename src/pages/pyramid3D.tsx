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

const options: Highcharts.Options = {
  chart: {
    type: 'pyramid',
    marginRight: 100,
    events: {
      load: function () {
        console.log('show data info', this)
        let angle = 60, splitHeight = 20, valueHeight = 0
        let elementInfo = this.seriesGroup.element.getBoundingClientRect()
        let elementWidth = elementInfo.width
        let elementHeight = elementInfo.height
        valueHeight = (elementHeight - (this.series[0].data.length - 1) * splitHeight) / this.series[0].total
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
      width: '15%',
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
