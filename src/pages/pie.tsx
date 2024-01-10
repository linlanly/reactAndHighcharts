import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Highcharts3d from 'highcharts/highcharts-3d';
Highcharts3d(Highcharts)
interface dataObject {
  name: string,
  y: number,
  events?: any,
  h?: number
}
const minDepth = 30, maxDepth = 80, angle = 60
const dataList: Array<dataObject> = [
  {
    name: "红草莓",
    y: 687,
  },
  {
    name: "白草莓",
    y: 187,
  },
  {
    name: "红颜草莓",
    y: 168,
  },
  {
    name: "甜宝草莓",
    y: 287,
  },
  {
    name: "甜宝草莓",
    y: 422,
  }
]
interface chartObject {
  point: any,   // 模块对应point信息
  type: string, // 移入或移出
  hight: number // 模块高度
}
const chartInfo: chartObject = {
  hight: minDepth,
  type: 'amplify',
  point: null
}
/**
 * 为数据添加鼠标移入移出事件
 */
function initCharts() {
  dataList.forEach(item => {
    item.events = {
      mouseOver: function (params: any) {
        chartInfo.point = params.target
        chartInfo.type = 'amplify'
        chartInfo.hight = maxDepth
        setHightChart(chartInfo)
      },
      mouseOut: function (params: any) {
        chartInfo.point = params.target
        chartInfo.type = 'reduce'
        chartInfo.hight = minDepth
        setHightChart(chartInfo)
      }
    }
  })
}

/**
 * 为鼠标移入移出事件的模块调整高度
 * @param chartInfo 当前模块信息
 */
function setHightChart(chartInfo: chartObject) {
  let each = Highcharts.each;
  each([chartInfo.point], function (point: any) {
    let translateY: number = 0
    let depth = chartInfo.hight
    if (chartInfo.type === 'amplify') {
      translateY = -(depth - minDepth) * Math.sin(angle * Math.PI / 180)
    }
    let data = {
      translateY,
      depth
    }
    point.graphic.attr(data);
  })
}
const options: Highcharts.Options = {
  chart: {
    animation: false,
    backgroundColor: "none",
    type: "pie", //饼图
    margin: [0, 0, 0, 0],
    options3d: {
      enabled: true, //使用3d功能
      alpha: angle, //延y轴向内的倾斜角度
      beta: 0
    }
  },
  legend: {
    enabled: true, // 关闭图例
    align: "right", //水平方向位置
    verticalAlign: "top", //垂直方向位置
    layout: "vertical",
    x: 0,
    y: 30,
    symbolWidth: 10,
    symbolHeight: 10,
    symbolRadius: "50%", // 修改成圆
    itemMarginBottom: 8,
    labelFormat: "{name}&nbsp;&nbsp;&nbsp;&nbsp;{y}",
    itemStyle: {
      color: "#222",
      fontSize: 12,
    },
  },
  title: {
    // enabled: false,
    text: "",
  },
  subtitle: {
    text: "",
  },
  plotOptions: {
    pie: {
      allowPointSelect: false, // 禁用点击
      cursor: "pointer",
      depth: minDepth / 0.75,
      showInLegend: true,
      size: "65%", // 外圈直径大小
      innerSize: 95, // 内圈直径大小
      center: ["30%", "50%"],
      colors: [
        "rgba(157, 88, 32, .9)",
        "rgba(169, 199, 62, .9)",
        "rgba(11, 146, 89, .9)",
        "rgba(16, 138, 174, .9)",
        "rgba(0, 77, 161, .9)",
        "rgba(60, 32, 173, .9)",
      ],
      states: {
        inactive: {
          enabled: false
        },
        hover: {
          enabled: false
        }
      },
      dataLabels: {
        enabled: true, //是否显示饼图的线形tip
        distance: 0,
        align: "center",
        position: "center",
        pointFormatter: function () {
          return `${this.key}（${this.percentage.toFixed(0)}%）`
        },
        style: {
          fontSize: 13,
        },
      },
    },
  },
  credits: {
    enabled: false, // 禁用版权信息
  },
  series: [
    {
      type: "pie",
      data: dataList,
    },
  ],
}
export default function OtherChart() {
  initCharts()
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
