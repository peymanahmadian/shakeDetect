
import './App.css'
import { useShakeSensor } from './shakeDetect'

function App() {
  useShakeSensor({
    onAction: () => {
      alert("shaked baby");
    }
  })
  return (
    <>
      <div>sample</div>
    </>
  )
}

export default App
