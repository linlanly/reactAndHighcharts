import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Funnel from 'highcharts/modules/funnel';
import { getLinearGradient} from "./common.ts"
Funnel(Highcharts)

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
	// { name: '圣女果', y: 2377 },
	// { name: '无花果', y: 989 },
]

let seriesInfo = []
// 数据应该在哪里展示
dataList.forEach((item, index) => {
	item.direction = index % 2 ? 'left' : 'right'
})

// 设置间隔
let spliceData = dataList.reduce((a, b) => a + b.y, 0) * 3 / 100
dataList.forEach((item, index) => {
	if (index !== 0) {
		dataList.splice(index * 2 - 1, 0, {
			name: '',
			y: spliceData,
			events: {
				mouseOver: function (params: any) { // 防止鼠标移入显示数据
					params.preventDefault()
				}
			},
			dataLabels: {
				enabled: false
			}
		})
		colorList.splice(index * 2 - 1, 0, 'rgba(0,0,0,0)')
	}
})
/**
 * 设置金字塔的旋转点，按一定角度旋转金字塔
 * @param container load函数中的this
 */
function rotatePyramid(container: any) {
	let elementInfo = container.seriesGroup.element.getBoundingClientRect()
	let containerInfo = container.container.getBoundingClientRect()
	let elementWidth = elementInfo.width
	let elementHeight = elementInfo.height
	let radian = Math.atan(elementWidth / 2 / elementHeight)
	let angle = radian * 180 / Math.PI
	let positionX = elementInfo.x - containerInfo.x + elementInfo.width / 2
	let positionY = elementInfo.y - containerInfo.y
	seriesInfo = container.series

	container.series[1].group.element.style.transformOrigin = `${positionX}px ${positionY}px`
	container.series[0].group.element.style.transformOrigin = `${positionX}px ${positionY}px`

	let transform = container.series[1].group.element.getAttribute('transform')
	let translate = transform.match(/translate\((\d+),(\d+)\)/)[0]
	translate = translate.replace(/(\d+)/g, `$1px`)
	container.series[1].group.element.style.transform = `rotateZ(${angle}deg) ` + translate
	container.series[0].group.element.style.transform = `rotateZ(-${angle}deg) ` + translate
}

/**
 * 绘制金字塔的牵引线
 * @param container load函数中的this
 */
function dealLine(container: any) {
	let radius = 3
	container.series.forEach((serie: any) => {
		Array.isArray(serie.data) && serie.data.forEach((label: any) => {
			if (label.dataLabel) {
				let points = label.dataLabel.connector.pathArray
				let startPoint = [points[0][1], points[0][2]]
				let endPoint = [points[2][1], points[2][2]]
				let circlePoint = [points[2][1], points[2][2]]
				let radian = Math.atan((endPoint[1] - startPoint[1]) / (endPoint[0] - startPoint[0]))
				circlePoint[1] -= radius * 2 * Math.sin(radian)
				if (label.options.direction === 'left') {
					circlePoint[0] -= radius * 2 * Math.cos(radian)
				} else {
					circlePoint[0] += radius * 2 * Math.cos(radian)
				}
				let dStr = `M ${startPoint.join(' ')} L ${endPoint.join(' ')} A  ${radius} ${radius}  0 1 1 ${circlePoint.join(' ')} A ${radius} ${radius}  0 1 1 ${endPoint.join(' ')}`
				label.dataLabel.connector.element.setAttribute('d', dStr)
				label.dataLabel.connector.element.setAttribute('stroke-width', 2)
				label.dataLabel.connector.element.setAttribute('stroke', 'white')
			}
		})
	})
}

const options: any = {
	chart: {
		type: 'pyramid',
		marginRight: 100,
		events: {
			load: function () {
				rotatePyramid(this)
				dealLine(this)
			},
			redraw: function () {
				let _self = this as any
				let transform = _self.series[1].group.element.getAttribute('transform')
				let translate = transform.match(/translate\((\d+),(\d+)\)/)[0]
				translate = translate.replace(/(\d+)/g, `$1px`)
				_self.series[1].group.element.style.transform = `rotateZ(0deg)` + translate;
				_self.series[0].group.element.style.transform = `rotateZ(0deg)` + translate;
				rotatePyramid(this)
				dealLine(this)
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
				useHTML: true,
				formatter: function () {
					let _self = this as any
					return `<div style="margin-left: -15px;margin-right: -15px;margin-top: -2px; width: 60px;">
            <div style="border-bottom: 2px solid white">${_self.key}</div>
            <div>${_self.y}</div>
          </div>`
				},
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
		colors: colorList.map(item => {
			if (item.linearGradient) {
				return {
					...item,
					linearGradient: {
						x1: 0.4,
						x2: 0.2,
						y2: 0.7,
					}
				}
			} else {
				return item
			}
		}),
		data: dataList.map(item => {
			return changeDataLabels(item, 'left')
		})
	}, {
		name: '水果',
		type: 'pyramid',
		dataLabels: {
			position: 'left'
		},
		colors: colorList,
		data: dataList.map(item => {
			return changeDataLabels(item, 'right')
		})
	}]
}
function changeDataLabels(data: dataObj, direction: string): dataObj {
	let temp = JSON.parse(JSON.stringify(data))
	if (temp.direction !== direction) {
		temp.dataLabels = {
			enabled: false
		}
	}
	return temp
}
export default function OtherChart() {
	return (
		<>{
			<div style={{ width: '100%', height: '30%', position: 'relative', backgroundColor: 'red' }}>
				<HighchartsReact
					highcharts={Highcharts}
					options={options}
					{...Highcharts.Props}
				/>
				<div style={{ position: 'absolute', zIndex: 200, width: '4px', height: '4px', backgroundColor: 'purple', top: 0, left: 0 }} id="more"></div>
			</div>
		}
		</>
	)
}
