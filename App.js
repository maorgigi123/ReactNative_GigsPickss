import 'react-native-gesture-handler'
import React, { useEffect, useRef, useState } from 'react';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import {LogBox, Platform, StatusBar} from 'react-native';
import { store, persistor } from './store/store'; // Adjust the path according to your project structure
import AppStack from './appStack';
import { Audio } from 'expo-av';
import Splash from './pages/components/Splash';
import Animated, { FadeIn } from 'react-native-reanimated';
import { UserProvider } from './store/userContext';
import { selectCurrentTheme } from './store/user/user.selector';
  // persistor.purge();

const App = () => {

  const [splahAniamtionFinish, setSplashAnimationFinish] = useState(Platform.OS === 'android' ? true : false)
  LogBox.ignoreLogs(['Warning: ...']); // Replace 'Warning: ...' with the actual warning text
  LogBox.ignoreAllLogs();
  if (Platform.OS === "ios")
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    return (
      <>
      {splahAniamtionFinish? 
      <Animated.View entering={FadeIn} style={{flex:1}}>
            <Provider store={store}>
              <PersistGate loading={null} persistor={persistor}>
                <UserProvider>
                    <AppStack/>
                </UserProvider>
              </PersistGate>
          </Provider> 
      </Animated.View>
          :
        <Splash setSplashAnimationFinish={setSplashAnimationFinish}/>
      }
      </>
      
      
    );
};
export default App;
