import React from "react";
import {Composition} from "remotion";
import {TestComp} from "./TestComp";

// 10 seconds @ 30fps = 300 frames. 1920x1080 cinematic baseline.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TestComp"
        component={TestComp}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
