package com.womenfirst;

import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import android.os.Bundle;
import com.facebook.react.ReactActivity;
import org.devio.rn.splashscreen.SplashScreen;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import com.facebook.react.bridge.ReactContext;

import android.Manifest;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbManager;
import android.util.ArrayMap;
import android.util.Base64;
import android.util.Log;
import android.view.View;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;
import com.facebook.react.bridge.Promise;
import com.womenfirst.ZKUSBManager.ZKUSBManager;
import com.womenfirst.ZKUSBManager.ZKUSBManagerListener;
import com.womenfirst.util.PermissionUtils;
import com.zkteco.android.biometric.FingerprintExceptionListener;
import com.zkteco.android.biometric.core.device.ParameterHelper;
import com.zkteco.android.biometric.core.device.TransportType;
import com.zkteco.android.biometric.core.utils.LogHelper;
import com.zkteco.android.biometric.core.utils.ToolUtils;
import com.zkteco.android.biometric.module.fingerprintreader.FingerprintCaptureListener;
import com.zkteco.android.biometric.module.fingerprintreader.FingerprintSensor;
import com.zkteco.android.biometric.module.fingerprintreader.FingprintFactory;
import com.zkteco.android.biometric.module.fingerprintreader.ZKFingerService;
import com.zkteco.android.biometric.module.fingerprintreader.exception.FingerprintException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import com.facebook.react.bridge.UiThreadUtil;
import java.io.ByteArrayOutputStream;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import android.provider.MediaStore;
import android.content.Intent;
import com.facebook.react.bridge.WritableNativeMap;
import android.graphics.BitmapFactory;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class MainActivity extends ReactActivity {

  private static final int ZKTECO_VID =   0x1b55;
  private static final int LIVE20R_PID =   0x0120;
  private static final int LIVE10R_PID =   0x0124;
  private static final String TAG = "MainActivity";
  private final int REQUEST_PERMISSION_CODE = 9;
  private ZKUSBManager zkusbManager = null;
  private FingerprintSensor fingerprintSensor = null;
  private TextView textView = null;
  private EditText editText = null;
  private ImageView imageView = null;
  private int usb_vid = ZKTECO_VID;
  private int usb_pid = 0;
  private boolean bStarted = false;
  private int deviceIndex = 0;
  private boolean isReseted = false;
  private String strUid = null;
  private final static int ENROLL_COUNT   =   3;
  private int enroll_index = 0;
  private byte[][] regtemparray = new byte[3][2048];  //register template buffer array
  private boolean bRegister = false;
  private DBManager dbManager = new DBManager();
  private String dbFileName;
  private static final int REQUEST_IMAGE_CAPTURE = 1;
  
  private static final int CHUNK_SIZE = 1024 * 10;
  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "PersonWithDisabilityExecutive";
  }
  // @Override
  //   protected void onCreate(Bundle savedInstanceState) {
  //       // SplashScreen.show(this);  // here
  //       super.onCreate(savedInstanceState);
  //   }

 @Override
  protected void onCreate(Bundle savedInstanceState) {
      super.onCreate(savedInstanceState);
      setContentView(R.layout.activity_main);
    dbFileName = getFilesDir().getAbsolutePath() + "/zkfinger10.db";
    initUI();
    checkStoragePermission();
    zkusbManager = new ZKUSBManager(this.getApplicationContext(), zkusbManagerListener);
    zkusbManager.registerUSBPermissionReceiver();
  }
  /**
   * Returns the instance of the {@link ReactActivityDelegate}. There the RootView is created and
   * you can specify the renderer you wish to use - the new renderer (Fabric) or the old renderer
   * (Paper).
   */
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new MainActivityDelegate(this, getMainComponentName());
  }

  public static class MainActivityDelegate extends ReactActivityDelegate {
    public MainActivityDelegate(ReactActivity activity, String mainComponentName) {
      super(activity, mainComponentName);
    }

    @Override
    protected ReactRootView createRootView() {
      ReactRootView reactRootView = new ReactRootView(getContext());
      // If you opted-in for the New Architecture, we enable the Fabric Renderer.
      reactRootView.setIsFabric(BuildConfig.IS_NEW_ARCHITECTURE_ENABLED);
      return reactRootView;
    }

    // @Override
    // protected boolean isConcurrentRootEnabled() {
    //   // If you opted-in for the New Architecture, we enable Concurrent Root (i.e. React 18).
    //   // More on this on https://reactjs.org/blog/2022/03/29/react-v18.html
    //   return BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
    // }

 
  }


  public void showToast(String message) {
    Toast.makeText(getApplicationContext(), message, Toast.LENGTH_SHORT).show();
  }
  void doRegister(byte[] template)
  {
      byte[] bufids = new byte[256];
      int ret = ZKFingerService.identify(template, bufids, 70, 1);
      if (ret > 0)
      {
          String strRes[] = new String(bufids).split("\t");
          setResult("the finger already enroll by " + strRes[0] + ",cancel enroll");
          bRegister = false;
          enroll_index = 0;
          return;
      }
      if (enroll_index > 0 && (ret = ZKFingerService.verify(regtemparray[enroll_index-1], template)) <= 0)
      {
          setResult("please press the same finger 3 times for the enrollment, cancel enroll, socre=" + ret);
          bRegister = false;
          enroll_index = 0;
          return;
      }
      System.arraycopy(template, 0, regtemparray[enroll_index], 0, 2048);
      enroll_index++;
      if (enroll_index == ENROLL_COUNT) {
          bRegister = false;
          enroll_index = 0;
          byte[] regTemp = new byte[2048];
          if (0 < (ret = ZKFingerService.merge(regtemparray[0], regtemparray[1], regtemparray[2], regTemp))) {
              int retVal = 0;
              retVal = ZKFingerService.save(regTemp, strUid);
              if (0 == retVal)
              {
                  String strFeature = Base64.encodeToString(regTemp, 0, ret, Base64.NO_WRAP);
                  dbManager.insertUser(strUid, strFeature);
                  setResult("enroll succ");
              }
              else
              {
                  setResult("enroll fail, add template fail, ret=" + retVal);
              }
          } else {
              setResult("enroll fail");
          }
          bRegister = false;
      } else {
          setResult("You need to press the " + (3 - enroll_index) + " times fingerprint");
      }
  }

  void doIdentify(byte[] template)
  {
      byte[] bufids = new byte[256];
      int ret = ZKFingerService.identify(template, bufids, 70, 1);
      if (ret > 0) {
          String strRes[] = new String(bufids).split("\t");
          setResult("identify succ, userid:" + strRes[0].trim() + ", score:" + strRes[1].trim());
      } else {
          setResult("identify fail, ret=" + ret);
      }
  }

    // public void sendEvent(String eventName, Bundle params) {
    //     getReactInstanceManager().getCurrentReactContext()
    //         .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
    //         .emit(eventName, params);
    // }

    // public void simulateEvent() {
    //     Bundle params = new Bundle();
    //     params.putString("message", "Hello from MainActivity!");
    //     sendEvent("MainActivityEvent", params);
    // }
//   public FingerprintCaptureListener fingerprintCaptureListener = new FingerprintCaptureListener() {
//     @Override
//     public void captureOK(byte[] fpImage) {
//         final Bitmap bitmap = ToolUtils.renderCroppedGreyScaleBitmap(fpImage, fingerprintSensor.getImageWidth(), fingerprintSensor.getImageHeight());
//         runOnUiThread(new Runnable() {
//             public void run() {
//                  sendBitmapToReactNative(bitmap);
//                 //                runOnUiThread(new Runnable() {
//                 //                    public void run() {
//                 //                        imageView.setImageBitmap(bitmap);
//                 //                    }
//                 //                });
//             }
//         });

//     }

//     @Override
//     public void captureError(FingerprintException e) {
//         // nothing to do
//         // sendEvent("onFingerprintCaptureError", e.getMessage());
//     }

//     @Override
//     public void extractOK(byte[] fpTemplate) {
//         if (bRegister)
//         {
//             doRegister(fpTemplate);
//         }
//         else
//         {
//             doIdentify(fpTemplate);
//         }
//     }

//     @Override
//     public void extractError(int i) {
//         // sendEvent("onFingerprintExtractError", i);
//     }
//   };
 

//   public FingerprintExceptionListener fingerprintExceptionListener = new FingerprintExceptionListener() {
//     @Override
//     public void onDeviceException() {
//         // LogHelper.e("usb exception!!!");
//         Toast.makeText(getApplicationContext(), "usb exception!!!", Toast.LENGTH_SHORT).show();
//         if (!isReseted) {
//             try {
//                 fingerprintSensor.openAndReboot(deviceIndex);
//             } catch (FingerprintException e) {
//                 e.printStackTrace();
//             }
//             isReseted = true;
//         }
//     }
//   };

//   public ZKUSBManagerListener zkusbManagerListener = new ZKUSBManagerListener() {
//       @Override
//       public void onCheckPermission(int result) {
//           afterGetUsbPermission();
//       }

//       @Override
//       public void onUSBArrived(UsbDevice device) {
//           if (bStarted)
//           {
//               closeDevice();
//               tryGetUSBPermission();
//           }
//       }

//       @Override
//       public void onUSBRemoved(UsbDevice device) {
//           // LogHelper.d("usb removed!");
//             Toast.makeText(getApplicationContext(), "usb removed!", Toast.LENGTH_SHORT).show();
//       }
//   };

    public FingerprintCaptureListener fingerprintCaptureListener = new FingerprintCaptureListener() {
        @Override
        public void captureOK(byte[] fpImage) {
            final Bitmap bitmap = ToolUtils.renderCroppedGreyScaleBitmap(fpImage, fingerprintSensor.getImageWidth(), fingerprintSensor.getImageHeight());
            final Bitmap resizedBitmap = resizeBitmap(bitmap, 100, 100);
            final String base64String = bitmapToBase64(resizedBitmap);
            
            sendBitmapToReactNative(base64String);

            // runOnUiThread(new Runnable() {
            //     public void run() {
            //         imageView.setImageBitmap(bitmap);
            //     }
            // });


            // final int imageWidth = fingerprintSensor.getImageWidth();
            // final int imageHeight = fingerprintSensor.getImageHeight();
            // runOnUiThread(new Runnable() {
            //     public void run() {
            //         Bitmap bitmap = BitmapFactory.decodeByteArray(fpImage, 0, fpImage.length);
            //         if (bitmap != null) {
            //             Bitmap resizedBitmap = resizeBitmap(bitmap, 1024, 1024);  // Adjust max width/height as needed
            //             String base64String = bitmapToBase64(resizedBitmap);
            //             sendBitmapToReactNative(base64String);
            //         } else {
            //             Log.e("FingerprintCapture", "Failed to decode image");
            //         }
            //     }
            // });

           
            // // Bitmap bitmap = BitmapFactory.decodeByteArray(fpImage, 0, fpImage.length);
            // // if (bitmap == null) {
            // //     promise.reject("INVALID_IMAGE", "Failed to decode image");
            // //     return;
            // // }

            // Bitmap resizedBitmap = resizeBitmap(bitmap, 1024, 1024);  // Adjust max width/height as needed
            // String base64String = bitmapToBase64(resizedBitmap);
            // sendBitmapToReactNative(bitmap);

            // promise.resolve("Image sent successfully");
            // runOnUiThread(new Runnable() {
            //     public void run() {
            //         imageView.setImageBitmap(bitmap);
            //     }
            // });
        }

        

        // private String bitmapToBase64(Bitmap bitmap) {
        //     ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        //     bitmap.compress(Bitmap.CompressFormat.JPEG, 80, byteArrayOutputStream);  // Compressing to JPEG with 80% quality
        //     byte[] byteArray = byteArrayOutputStream.toByteArray();
        //     return Base64.encodeToString(byteArray, Base64.DEFAULT);
        // }

        @Override
        public void captureError(FingerprintException e) {
            // nothing to do
        }

        @Override
        public void extractOK(byte[] fpTemplate) {
            if (bRegister)
            {
                doRegister(fpTemplate);
            }
            else
            {
                doIdentify(fpTemplate);
            }
        }

        @Override
        public void extractError(int i) {
            // nothing to do
        }
    };

    public Bitmap resizeBitmap(Bitmap bitmap, int maxWidth, int maxHeight) {
        int width = bitmap.getWidth();
        int height = bitmap.getHeight();

        float aspectRatio = (float) width / height;
        if (width > maxWidth || height > maxHeight) {
            if (width > height) {
                width = maxWidth;
                height = (int) (maxWidth / aspectRatio);
            } else {
                height = maxHeight;
                width = (int) (maxHeight * aspectRatio);
            }
        }
        return Bitmap.createScaledBitmap(bitmap, width, height, true);
    }

    public String bitmapToBase64(Bitmap bitmap) {
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        bitmap.compress(Bitmap.CompressFormat.JPEG, 80, byteArrayOutputStream);  // Compressing to JPEG with 80% quality
        byte[] byteArray = byteArrayOutputStream.toByteArray();
        return Base64.encodeToString(byteArray, Base64.DEFAULT);
    }

    public void sendBitmapToReactNative(String base64String) {
        ReactContext reactContext = getReactNativeHost().getReactInstanceManager().getCurrentReactContext();
        WritableMap params = Arguments.createMap();
        params.putString("imageBase64", base64String);

        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit("ImageReceivedEvent", params);
    }
        
    public FingerprintExceptionListener fingerprintExceptionListener = new FingerprintExceptionListener() {
        @Override
        public void onDeviceException() {
            LogHelper.e("usb exception!!!");
            if (!isReseted) {
                try {
                    fingerprintSensor.openAndReboot(deviceIndex);
                } catch (FingerprintException e) {
                    e.printStackTrace();
                }
                isReseted = true;
            }
        }
    };

    public ZKUSBManagerListener zkusbManagerListener = new ZKUSBManagerListener() {
        @Override
        public void onCheckPermission(int result) {
            afterGetUsbPermission();
        }

        @Override
        public void onUSBArrived(UsbDevice device) {
            if (bStarted)
            {
                closeDevice();
                tryGetUSBPermission();
            }
        }

        @Override
        public void onUSBRemoved(UsbDevice device) {
            LogHelper.d("usb removed!");
        }
    };

  private void initUI()
  {
    textView = (TextView)findViewById(R.id.txtResult);
    editText = (EditText)findViewById(R.id.editID);
    imageView = (ImageView)findViewById(R.id.imageFP);
  }

  /**
   * storage permission
   */
  private void checkStoragePermission() {
      String[] permission = new String[]{
              Manifest.permission.READ_EXTERNAL_STORAGE,
              Manifest.permission.WRITE_EXTERNAL_STORAGE
      };
      ArrayList<String> deniedPermissions = PermissionUtils.checkPermissions(this, permission);
      if (deniedPermissions.isEmpty()) {
          //permission all granted
          Log.i(TAG, "[checkStoragePermission]: all granted");
      } else {
          int size = deniedPermissions.size();
          String[] deniedPermissionArray = deniedPermissions.toArray(new String[size]);
          PermissionUtils.requestPermission(this, deniedPermissionArray, REQUEST_PERMISSION_CODE);
      }
  }


  @Override
  public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
      super.onRequestPermissionsResult(requestCode, permissions, grantResults);
      switch (requestCode) {
          case REQUEST_PERMISSION_CODE:
              boolean granted = true;
              for (int result : grantResults) {
                  if (result != PackageManager.PERMISSION_GRANTED) {
                      granted = false;
                  }
              }
              if (granted) {
                  Toast.makeText(this, "Permission granted", Toast.LENGTH_SHORT).show();
              } else {
                //   Toast.makeText(this, "Permission Denied,The application can't run on this device", Toast.LENGTH_SHORT).show();
              }
          default:
              break;
      }
  }

  public void createFingerprintSensor(){
      if (null != fingerprintSensor)
      {
          FingprintFactory.destroy(fingerprintSensor);
          fingerprintSensor = null;
      }
      // Define output log level
      LogHelper.setLevel(Log.VERBOSE);
      LogHelper.setNDKLogLevel(Log.ASSERT);
      // Start fingerprint sensor
      Map deviceParams = new HashMap();
      //set vid
      deviceParams.put(ParameterHelper.PARAM_KEY_VID, usb_vid);
      //set pid
      deviceParams.put(ParameterHelper.PARAM_KEY_PID, usb_pid);
      fingerprintSensor = FingprintFactory.createFingerprintSensor(getApplicationContext(), TransportType.USB, deviceParams);
  }

  public boolean enumSensor(){
    
      UsbManager usbManager = (UsbManager)this.getSystemService(Context.USB_SERVICE);
      for (UsbDevice device : usbManager.getDeviceList().values()) {
          int device_vid = device.getVendorId();
          int device_pid = device.getProductId();
          if (device_vid == ZKTECO_VID && (device_pid == LIVE20R_PID || device_pid == LIVE10R_PID))
          {
              usb_pid = device_pid;
              return true;
          }
      }
      return false;
  }


   public void tryGetUSBPermission() {
   
      zkusbManager.initUSBPermission(usb_vid, usb_pid);
    }

  public void afterGetUsbPermission()
  {
      openDevice();
  }

  public void openDevice(){
      createFingerprintSensor();
      bRegister = false;
      enroll_index = 0;
      isReseted = false;
      try {
          //fingerprintSensor.setCaptureMode(1);
          fingerprintSensor.open(deviceIndex);
          //load all templates form db
          if (dbManager.opendb(dbFileName) && dbManager.getCount() > 0)
          {
              HashMap<String, String> vUserList;
              vUserList = dbManager.queryUserList();
              int ret = 0;
              if (vUserList.size() > 0)
              {
                  for (Map.Entry<String, String> entry : vUserList.entrySet()) {
                      String strID = entry.getKey();
                      String strFeature = entry.getValue();
                      byte[] blobFeature = Base64.decode(strFeature, Base64.NO_WRAP);
                      ret = ZKFingerService.save(blobFeature, strID);
                      if (0 != ret)
                      {
                          LogHelper.e("add [" + strID + "] template failed, ret=" + ret);
                      }
                  }
              }
          }
          {
              // device parameter
              LogHelper.d("sdk version" + fingerprintSensor.getSDK_Version());
              LogHelper.d("firmware version" + fingerprintSensor.getFirmwareVersion());
              LogHelper.d("serial:" + fingerprintSensor.getStrSerialNumber());
              LogHelper.d("width=" + fingerprintSensor.getImageWidth() + ", height=" + fingerprintSensor.getImageHeight());
          }
          fingerprintSensor.setFingerprintCaptureListener(deviceIndex, fingerprintCaptureListener);
        //   fingerprintSensor.SetFingerprintExceptionListener(fingerprintExceptionListener);
          fingerprintSensor.startCapture(deviceIndex);
          bStarted = true;
          // textView.setText("connect success!");
            Toast.makeText(this, "connect success!", Toast.LENGTH_SHORT).show();
      } catch (FingerprintException e) {
          e.printStackTrace();
          // try to  reboot the sensor
          try {
              fingerprintSensor.openAndReboot(deviceIndex);
          } catch (FingerprintException ex) {
              ex.printStackTrace();
          }
          Toast.makeText(this, "connect failed!", Toast.LENGTH_SHORT).show();
      }
  }

  public void closeDevice(){
      if (bStarted)
      {
          try {
              fingerprintSensor.stopCapture(deviceIndex);
              fingerprintSensor.close(deviceIndex);
          } catch (FingerprintException e) {
              e.printStackTrace();
          }
          bStarted = false;
      }
  }

  public void onBnStart(View view){
      if (bStarted)
      {
          textView.setText("Device already connected!");
          return;
      }
      if (!enumSensor())
      {
          textView.setText("Device not found!");
          return;
      }
      tryGetUSBPermission();
  }

  public void onBnStop(View view){
      if (!bStarted)
      {
          textView.setText("Device not connected!");
          return;
      }
      closeDevice();
      textView.setText("Device closed!");
  }

  public void onBnRegister(View view){
      if (bStarted) {
          strUid = editText.getText().toString();
          if (null == strUid || strUid.isEmpty()) {
              // textView.setText("Please input your user id");
              Toast.makeText(this, "Please input your user id!", Toast.LENGTH_SHORT).show();
              bRegister = false;
              return;
          }
          if (dbManager.isUserExited(strUid)) {
              bRegister = false;
              // textView.setText("The user[" + strUid + "] had registered!");
              Toast.makeText(this, "The user[" + strUid + "] had registered!", Toast.LENGTH_SHORT).show();
              return;
          }
          bRegister = true;
          enroll_index = 0;
          // textView.setText("Please press your finger 3 times.");
            Toast.makeText(this, "Please press your finger 3 times.", Toast.LENGTH_SHORT).show();
      } else {
          // textView.setText("Please start capture first");
          Toast.makeText(this, "Please start capture first!", Toast.LENGTH_SHORT).show();
      }
  }

  public void onBnIdentify(View view){
      if (bStarted) {
          bRegister = false;
          enroll_index = 0;
      } else {
          // textView.setText("Please start capture first");
          Toast.makeText(this, "Please start capture first!", Toast.LENGTH_SHORT).show();
      }
  }

  private void setResult(String result){
      final String mStrText = result;
      runOnUiThread(new Runnable() {
          @Override
          public void run() {
              textView.setText(mStrText);
          }
      });
  }

  public void onBnDelete(View view){
      if (bStarted) {
          strUid = editText.getText().toString();
          if (null == strUid || strUid.isEmpty()) {
              textView.setText("Please input your user id");
              return;
          }
          if (!dbManager.isUserExited(strUid)) {
              textView.setText("The user no registered");
              return;
          }
          new AlertDialog.Builder(this)
                  .setTitle("Do you want to delete the user ?")
                  .setIcon(android.R.drawable.ic_dialog_info)
                  .setPositiveButton("Yes", new DialogInterface.OnClickListener() {
                      @Override
                      public void onClick(DialogInterface dialog, int which) {
                          if (dbManager.deleteUser(strUid)) {
                              ZKFingerService.del(strUid);
                              setResult("Delete success !");
                          } else {
                              setResult("Open db fail !");
                          }
                      }
                  })
                  .setNegativeButton("No", new DialogInterface.OnClickListener() {
                      @Override
                      public void onClick(DialogInterface dialog, int which) {
                      }
                  }).show();
      }
  }

  public void onBnClear(View view){
      if (bStarted) {
          new AlertDialog.Builder(this)
                  .setTitle("Do you want to delete all the users ?")
                  .setIcon(android.R.drawable.ic_dialog_info)
                  .setPositiveButton("Yes", new DialogInterface.OnClickListener() {
                      @Override
                      public void onClick(DialogInterface dialog, int which) {
                          if (dbManager.clear()) {
                              ZKFingerService.clear();
                              setResult("Clear success！");
                          } else {
                              setResult("Open db fail！");
                          }
                      }
                  })
                  .setNegativeButton("no", new DialogInterface.OnClickListener() {
                      @Override
                      public void onClick(DialogInterface dialog, int which) {

                      }
                  })
                  .show();
      }
  }

  @Override
  protected void onDestroy() {
      super.onDestroy();
      if (bStarted)
      {
          closeDevice();
      }
      zkusbManager.unRegisterUSBPermissionReceiver();
  }
}
