
import './App.css'
import { useShakeSensor } from './shakeDetect'

function App() {
  async function enableMotionSensor() {
    try {
      const motionEvent = DeviceMotionEvent as typeof DeviceMotionEvent & {
        requestPermission?: () => Promise<PermissionState>
      }

      if (
        typeof motionEvent !== 'undefined' &&
        typeof motionEvent.requestPermission === 'function'
      ) {
        const permission = await motionEvent.requestPermission()

        if (permission !== 'granted') {
          throw new Error('Device motion permission was not granted')
        }
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to access device motion sensor')
    }
  }

  useShakeSensor({
    onAction: () => {
      alert("shaked baby");
    }
  })
  return (
    <>
      <button onClick={enableMotionSensor}>Enable motion sensor</button>
      <div>sample</div>
    </>
  )
}

export default App
