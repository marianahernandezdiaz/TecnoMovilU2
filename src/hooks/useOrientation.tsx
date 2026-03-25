import * as ScreenOrientation from "expo-screen-orientation";
import { useEffect, useState } from "react";

export default function useOrientation() {
  const [orientation, setOrientation] = useState("portrait");

  useEffect(() => {
    const update = async () => {
      const o = await ScreenOrientation.getOrientationAsync();

      if (
        o === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
        o === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
      ) {
        setOrientation("landscape");
      } else {
        setOrientation("portrait");
      }
    };

    update();

    const sub = ScreenOrientation.addOrientationChangeListener(update);

    return () => {
      ScreenOrientation.removeOrientationChangeListener(sub);
    };
  }, []);

  return orientation;
}