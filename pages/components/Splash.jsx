import { View, Text, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import LottieView from 'lottie-react-native';
import Animated, { FadeOut } from 'react-native-reanimated';
import { persistor } from '../../store/store';

export default function Splash({ setSplashAnimationFinish }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashAnimationFinish(true);
    }, 3500); 

    return () => clearTimeout(timer); // Clear the timer if the component unmounts
  }, []);
  return (
    <Animated.View exiting={FadeOut} style={{ flex: 1 }}>
      <LottieView
        source={require('../../assets/splash.json')}
        autoPlay
        loop={false}
        resizeMode='cover'
      />
    </Animated.View>
  );
}
