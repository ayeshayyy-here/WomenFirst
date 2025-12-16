package com.womenfirst;

import android.app.Application;
import android.content.Context;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.config.ReactFeatureFlags;

import com.facebook.soloader.SoLoader;
import com.dooboolab.audiorecorderplayer.RNAudioRecorderPlayerPackage;
import java.lang.reflect.InvocationTargetException;
import java.util.List;
import com.rnfs.RNFSPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import android.content.BroadcastReceiver;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import org.jetbrains.annotations.Nullable;
// import com.wenkesj.voice.VoicePackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;

// import com.brentvatne.react.ReactVideoPackage;


public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost =
      new ReactNativeHost(this) {

        @Override
        public boolean getUseDeveloperSupport() {
          return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
          List<ReactPackage> packages = new PackageList(this).getPackages();
          packages.add(new ZKTecoPackage());
          return packages;
        }

        @Override
        protected String getJSMainModuleName() {
          return "index";
        }
      };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    ReactFeatureFlags.useTurboModules = false;
    SoLoader.init(this, false);
  
  }
}
