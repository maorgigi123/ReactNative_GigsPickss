import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Animated, { Easing, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const FadeWarm = ({ uri, style, resizeMode }) => {
  const colorOverlay = useSharedValue('rgba(255, 0, 0, 0)'); // Transparent overlay initially

  useEffect(() => {
    colorOverlay.value = withTiming('rgba(255, 100, 100, 0.5)', {
      duration: 100,
      easing: Easing.inOut(Easing.ease),
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: colorOverlay.value,
  }));

  return (
    <View style={[style]}>
      <Image
        source={{ uri: uri }}
        style={style}
        resizeMode={resizeMode}
      />
      <Animated.Image style={[styles.overlay, animatedStyle,style]}  resizeMode={resizeMode} />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 100, 100, 0)', // Initial transparent color
  },
});

export default FadeWarm;
