import React, { useRef } from 'react';
import { StyleSheet } from 'react-native';
import {
  PanGestureHandler,
  PinchGestureHandler,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const ZoomableImage = ({ source, style }) => {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const lastScale = useSharedValue(1);
  const lastTranslateX = useSharedValue(0);
  const lastTranslateY = useSharedValue(0);

  const panRef = useRef();
  const pinchRef = useRef();

  const pinchHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startScale = scale.value;
    },
    onActive: (event, ctx) => {
      scale.value = ctx.startScale * event.scale;

      // Limit zooming scale
      if (scale.value < 1) {
        scale.value = 1;
      } else if (scale.value > 3) {
        scale.value = 3; // Adjust max zoom level as needed
      }
    },
    onEnd: () => {
      if (scale.value <= 1) {
        scale.value = withSpring(1);
        translateX.value = withSpring(0); // Reset translateX
        translateY.value = withSpring(0); // Reset translateY
      } else if (scale.value > 3) {
        scale.value = withSpring(3);
      } else {
        scale.value = withSpring(1); // Reset to default size if zoom level is within acceptable bounds
      }
      lastScale.value = scale.value;
    },
  });

  const panHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startTranslateX = translateX.value;
      ctx.startTranslateY = translateY.value;
    },
    onActive: (event, ctx) => {
      if (scale.value > 1) {
        const xBound = (scale.value - 1) * style.width / 2; // Adjust based on image width
        const yBound = (scale.value - 1) * style.height / 2; // Adjust based on image height
        translateX.value = ctx.startTranslateX + event.translationX;
        translateY.value = ctx.startTranslateY + event.translationY;

        // Apply boundaries to prevent moving outside
        translateX.value = Math.max(Math.min(translateX.value, xBound), -xBound);
        translateY.value = Math.max(Math.min(translateY.value, yBound), -yBound);
      }
    },
    onEnd: () => {
      translateX.value = lastTranslateX.value
      translateY.value = lastTranslateY.value
    //   lastTranslateY.value = translateY.value;
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  return (
    <PanGestureHandler
      ref={panRef}
      simultaneousHandlers={pinchRef}
      onGestureEvent={panHandler}
      onHandlerStateChange={panHandler}
    >
      <Animated.View style={{ flex: 1 }}>
        <PinchGestureHandler
          ref={pinchRef}
          onGestureEvent={pinchHandler}
          onHandlerStateChange={pinchHandler}
          simultaneousHandlers={panRef}
        >
          <Animated.Image
            source={source}
            style={[style, animatedStyle]}
            resizeMode="contain"
          />
        </PinchGestureHandler>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 300,
    height: 300,
  },
});

export default ZoomableImage;
