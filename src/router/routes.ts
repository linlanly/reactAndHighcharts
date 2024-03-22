
import { lazy } from "react"
export interface routeType {
  path: string,
  component?: any,
  childredn?: Array<routeType>
  meta?: {
    title?: string
    needLogin?: boolean
  }
  redirect?: string
}

function dealPath(path: string, component:string, title?:string, needLogin?: boolean, redirect?: string): routeType {
  let route: routeType = {
    path,
    component: lazy(() => import(component))
  }
  if (title) {
    route.meta = {
      title
    }
  }
  if (needLogin) {
    route.meta = {
      needLogin
    }
  }
  if (redirect) {
    route.redirect = redirect
  }
  return route
}

const routes: Array<routeType> = [
  dealPath('/', '../pages/highcharts/pie.tsx', '饼图鼠标移入'),
  dealPath('/pyramid', '../pages/highcharts/pyramid.tsx', '伪3D金字塔'),
  dealPath('/sunburst', '../pages/highcharts/sunburst.tsx', '旭日图绘制外部label'),
  dealPath('/pyramid3D', '../pages/highcharts/pyramid3D.tsx', '3D金字塔'),
  dealPath('/threeTest', '../pages/three/index.tsx'),
  dealPath('/threeBase', '../pages/three/base.tsx'),
  dealPath('/olTest', '../pages/openlayer/index.tsx'),
  dealPath('/drawLine', '../pages/three/drawLine.tsx'),
  dealPath('/updateScene', '../pages/three/updateScene.tsx'),
  dealPath('/dispose', '../pages/three/dispose.tsx'),
  dealPath('/ballshooter', '../pages/three/ballshooter.tsx'),
  dealPath('/glitch', '../pages/three/glitch.tsx'),
  dealPath('/animationBasic', '../pages/three/animationBasic.tsx'),
  dealPath('/webGLIndex', '../pages/webGL/index.tsx'),
  dealPath('/webGLDrawRectangle', '../pages/webGL/drawRectangle.tsx'),
  dealPath('/webGLDrawTriangle', '../pages/webGL/drawTriangle.tsx'),
  dealPath('/webGLDrawColorfulRectangle', '../pages/webGL/drawColorfulRectangle.tsx'),
  dealPath('/webGLDrawTexture', '../pages/webGL/drawTexture.tsx'),
  dealPath('/webGLDrawTransparency', '../pages/webGL/drawTransparency.tsx'),
  dealPath('/learnWebGLIndex', '../pages/learnWebGL/index.tsx'),
  dealPath('/learnWebGLTriangle', '../pages/learnWebGL/triangle.tsx')
]

export default routes