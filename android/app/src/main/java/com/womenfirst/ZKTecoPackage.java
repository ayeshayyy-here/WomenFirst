package com.womenfirst;


import com.womenfirst.ZKUSBManager.ZKUSBManager;
import com.womenfirst.ZKUSBManager.ZKUSBManagerListener;
import com.womenfirst.util.PermissionUtils;
import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.womenfirst.ZKTecoModule;




public class ZKTecoPackage implements ReactPackage {
     private ZKUSBManager zkusbManager = null;
     
    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();
        modules.add(new ZKTecoModule(reactContext));
        return modules;
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }
}