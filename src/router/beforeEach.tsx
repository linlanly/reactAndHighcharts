import { useRoutes, useNavigate, Navigate } from "react-router-dom";
import { Suspense } from "react"
import routes, { routeType } from './routes.ts'
type routeObj = typeof routeType
export default function Routes() {
  const element = useRoutes(renderRoutes(routes))
  return element
}

function renderRoutes(routes: routeObj) {
  return routes.map((item: routeObj) => {
    interface resType extends routeObj {
      element?: any
    }
    let res: resType = { ...item };
    if (!item?.path) return;
    if (item?.component) {
      const Component = item.component
      res.element = (
      <Suspense fallback={<div>正在加载，请稍后</div>}>
        <BeforeEach route={item}>
          <Component />
        </BeforeEach>
      </Suspense>)
    }

    if (item?.children) {
      res.children = renderRoutes(item.children)
    }
    if (item?.redirect) {
      res.element = (
        <Navigate to={item.redirect} replace />
      )
    }
    return res
  })
}

function BeforeEach(props: { route: routeObj, children: any }) {
  if (props?.route?.meta?.title) {
    document.title = props.route.meta.title
  }
  if (props?.route?.meta?.needLogin) {
    const navigate = useNavigate()
    navigate('/login')
  }
  return <div>
    {props.children}
  </div>
}