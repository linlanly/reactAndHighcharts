import { NavLink, useNavigate } from 'react-router-dom';
import { UseSelector, useDispatch, useSelector } from 'react-redux';
export default function SceneFirsts () {
  const navigate = useNavigate()
  const str = useSelector((store: any) => store.about)
  const dispatch = useDispatch()
  dispatch({counter: 2, type: '3'})
  console.log('show str', str)
  return (
    <div id="sceneFirst">
        2233
        <NavLink to={`/ThreeBase?id=1`}>文章1</NavLink>
        <button onClick={() => navigate('/ThreeBase?id=111&name=222', { replace: true, state: {id: 'more'} })}>路径跳转</button>
      </div>
  )
}
