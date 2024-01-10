import { Routes, Route } from "react-router-dom";
import { lazy } from "react";

const Pie = lazy(() => import("@/pages/pie.tsx")) // 3D饼图鼠标移入凸出
const Pyramid = lazy(() => import("@/pages/pyramid.tsx")) // 伪3D金字塔
const Sunburst = lazy(() => import("@/pages/sunburst.tsx")) // 旭日图加外部label
const Bar = lazy(() => import("@/pages/bar.tsx")) // 3D柱状图
const Pyramid3D = lazy(() => import("@/pages/pyramid3D.tsx")) // 3D柱状图

function RootRoute(): JSX.Element{
  return (
    <>
      <Routes>
        <Route path="/" element={<Pie />} />
        <Route path="/pyramid" element={<Pyramid />} />
        <Route path="/sunburst" element={<Sunburst />} />
        <Route path="/bar" element={<Bar />} />
        <Route path="/pyramid3D" element={<Pyramid3D />} />
      </Routes>
    </>
  )
}

export default RootRoute