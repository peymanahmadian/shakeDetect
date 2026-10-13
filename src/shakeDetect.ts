import { useEffect, useRef } from 'react'

export type AccelerationVector = {
  x: number
  y: number
  z: number
}

export type ShakeAction = (
  acceleration: AccelerationVector
) => void | Promise<void>

type UseShakeSensorOptions = {
  onAction: ShakeAction
  enabled?: boolean
  startThreshold?: number
  stopThreshold?: number
  directionThreshold?: number
}

export function useShakeSensor({
  onAction,
  enabled = true,
  startThreshold = 30,
  stopThreshold = 20,
  directionThreshold = 0.3
}: UseShakeSensorOptions): void {
  const onActionRef = useRef(onAction)

  const shakingRef =
    useRef<AccelerationVector | null>(null)

  useEffect(() => {
    onActionRef.current = onAction
  }, [onAction])

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return
    }

    const normalize = (
      vector: AccelerationVector
    ): [number, number, number] => {
      const length = Math.hypot(
        vector.x,
        vector.y,
        vector.z
      )

      if (length === 0) {
        return [0, 0, 0]
      }

      return [
        vector.x / length,
        vector.y / length,
        vector.z / length
      ]
    }

    const handleDeviceMotion = (
      event: DeviceMotionEvent
    ): void => {
      const source =
        event.accelerationIncludingGravity

      const latest: AccelerationVector = {
        x: source?.x ?? 0,
        y: source?.y ?? 0,
        z: source?.z ?? 0
      }

      const magnitude = Math.hypot(
        latest.x,
        latest.y,
        latest.z
      )

      // پایان حرکت فعلی
      if (magnitude < stopThreshold) {
        shakingRef.current = null
        return
      }

      // شروع حرکت فقط زمانی که شدت از threshold بیشتر باشد
      if (magnitude <= startThreshold) {
        return
      }

      if (shakingRef.current !== null) {
        const latestNormalized = normalize(latest)
        const initialNormalized = normalize(
          shakingRef.current
        )

        const dotProduct =
          latestNormalized[0] * initialNormalized[0] +
          latestNormalized[1] * initialNormalized[1] +
          latestNormalized[2] * initialNormalized[2]

        /*
         * اگر جهت حرکت به اندازه کافی تغییر کرده باشد،
         * حرکت جدید در نظر گرفته می‌شود.
         */
        if (
          Math.abs(dotProduct) < directionThreshold
        ) {
          shakingRef.current = null
        }
      }

      // جلوگیری از اجرای چندباره برای یک حرکت
      if (shakingRef.current !== null) {
        return
      }

      shakingRef.current = latest

      try {
        const result = onActionRef.current(latest)

        if (result instanceof Promise) {
          void result.catch((error: unknown) => {
            console.error(
              'Shake action failed:',
              error
            )
          })
        }
      } catch (error: unknown) {
        console.error(
          'Shake action failed:',
          error
        )
      }
    }

    window.addEventListener(
      'devicemotion',
      handleDeviceMotion
    )

    return () => {
      window.removeEventListener(
        'devicemotion',
        handleDeviceMotion
      )

      shakingRef.current = null
    }
  }, [
    enabled,
    startThreshold,
    stopThreshold,
    directionThreshold
  ])
}
