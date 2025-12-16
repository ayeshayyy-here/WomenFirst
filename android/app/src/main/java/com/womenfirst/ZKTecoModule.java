package com.womenfirst;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import android.Manifest;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbManager;
import android.os.Bundle;
import android.util.ArrayMap;
import android.util.Base64;
import android.util.Log;
import android.view.View;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;
import android.content.Intent;
import android.app.Activity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
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
import com.facebook.react.bridge.ReactApplicationContext;
import android.os.Build;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.io.ByteArrayOutputStream;
import com.facebook.react.modules.core.PermissionAwareActivity;
import com.facebook.react.modules.core.PermissionListener;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

import com.facebook.react.bridge.UiThreadUtil;
import android.graphics.Bitmap.CompressFormat;
import android.os.Environment;
import android.graphics.BitmapFactory;



public class ZKTecoModule extends ReactContextBaseJavaModule {

       
    private String dbFileName;
    private ZKUSBManager zkusbManager = null;
    private TextView textView = null;
    private EditText editText = null;
    private int usb_vid = ZKTECO_VID;
    private int usb_pid = 0;
    private boolean bStarted = false;
    private int deviceIndex = 0;
    private boolean isReseted = false;
    private String strUid = null;
    private final static int ENROLL_COUNT =3;
    private int enroll_index = 0;
    private byte[][] regtemparray = new byte[3][2048];  //register template buffer array
    private boolean bRegister = false;
    private DBManager dbManager = new DBManager();
    private ReactApplicationContext reactContext;
      private static final int ZKTECO_VID =   0x1b55;
    private static final int LIVE20R_PID =   0x0120;
    private static final int LIVE10R_PID =   0x0124;
     private final int REQUEST_PERMISSION_CODE = 9;
     private static final String TAG = "PermissionModule";
        private ImageView imageView;
        private FingerprintSensor fingerprintSensor;
    
    private static final int REQUEST_IMAGE_CAPTURE = 1;
    private Promise mPromise;
   


            ZKTecoModule(ReactApplicationContext reactContext) {


                super(reactContext);
                this.reactContext = reactContext;
                // fingerprintSensor = new FingerprintSensor();
                // initUi();

                // reactContext.addActivityEventListener(new BaseActivityEventListener() {
                    
                //     public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
                //         if (requestCode == REQUEST_PERMISSION_CODE) {
                //             boolean allGranted = true;
                //             for (int result : grantResults) {
                //                 if (result != PackageManager.PERMISSION_GRANTED) {
                //                     allGranted = false;
                //                     break;
                //                 }
                //             }

                //             if (permissionPromise != null) {
                //                 if (allGranted) {
                //                     permissionPromise.resolve(true);
                //                 } else {
                //                     permissionPromise.reject("PERMISSION_DENIED", "Permissions denied");
                //                 }
                //                 permissionPromise = null;
                //             }
                //         }
                //     }
                // });
                // initializeUSBManager();
                //   // checkStoragePermission();
                //   zkusbManager = new ZKUSBManager(reactContext.getApplicationContext(), zkusbManagerListener);
                //   zkusbManager.registerUSBPermissionReceiver();
                // // // // this.reactContext = reactContext
                // // zkusbManager = new ZKUSBManager(reactContext.getApplicationContext(), zkusbManagerListener);
                // // zkusbManager.registerUSBPermissionReceiver();
                
            }

            // private final ActivityEventListener mActivityEventListener = new BaseActivityEventListener() {
            //     // @Override
            //     public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data,Promise promise) {
            //         if (requestCode == REQUEST_IMAGE_CAPTURE) {
            //             if (resultCode == Activity.RESULT_OK) {
            //                 Bitmap imageBitmap = (Bitmap) data.getExtras().get("data");
            //                 processImage(imageBitmap,promise);
            //             } else {
            //                 mPromise.reject("IMAGE_CAPTURE_CANCELLED", "Image capture was cancelled");
            //             }
            //         }
            //     }
            // };


            // @ReactMethod
            // public void initializeUSBManager() {
            //     zkusbManager = new ZKUSBManager(reactContext, zkusbManagerListener);
            //     zkusbManager.registerUSBPermissionReceiver();
            // }


          
            // Method to handle USB permission
            // @ReactMethod
            // private void afterGetUsbPermission(Promise promise) {
            //     MainActivity activity = (MainActivity) getCurrentActivity();
            //     if (activity != null) {
            //         activity.openDevice();
            //         // activity.openDevice();
            //         promise.resolve("After Get USB");
            //     } else {
            //         promise.reject("Activity is null");
            //     }
            // }
            // @ReactMethod
            // private void openDevice(Promise promise) {
            //     MainActivity activity = (MainActivity) getCurrentActivity();
            //     if (activity != null) {
            //         activity.openDevice();
            //         // activity.openDevice();
            //         promise.resolve("After Get USB");
            //     } else {
            //         promise.reject("Activity is null");
            //     }
            // }

            // // Method to close the device
            // @ReactMethod
            // private void closeDevice(Promise promise) {
            //     MainActivity activity = (MainActivity) getCurrentActivity();
            //     if (activity != null) {
            //         activity.closeDevice();
            //         promise.resolve("Try Get Usb");
            //     } else {
            //         promise.reject("Activity is null");
            //     }            
            // }

            // // Method to try getting USB permission
            // @ReactMethod
            // private void tryGetUSBPermission(Promise promise) {
            //     MainActivity activity = (MainActivity) getCurrentActivity();
            //     if (activity != null) {
            //         activity.afterGetUsbPermission();

            //         // zkusbManager.initUSBPermission(usb_vid, usb_pid);
            //         promise.resolve("Try Get Usb");
            //     } else {
            //         promise.reject("Activity is null");
            //     }
            // }

            // @ReactMethod
            // public void startUSBManager() {
            //     // Start the USB manager if needed
            // }

        @ReactMethod
        public void showToast(String message, Promise promise) {
            MainActivity activity = (MainActivity) getCurrentActivity();
            if (activity != null) {
                activity.showToast(message);
                promise.resolve("Toast shown successfully");
            } else {
                promise.reject("Activity is null");
            }
        }

        @ReactMethod
        public void processImage(String base64String,Promise promise) {

            
            try {
                    MainActivity activity = (MainActivity) getCurrentActivity();
                    // Convert bitmap to Base64 string
                    if (activity != null) {


                        activity.sendBitmapToReactNative(base64String);
                        //     // if (bitmap == null) {
                        //     // promise.reject("INVALID_IMAGE", "image is null");
                        //     // return;
                        // }else{
                        //         promise.resolve(bitmap);
                        // }

                        // if (base64String == null || base64String.isEmpty()) {
                        //     Log.e(TAG, "Base64 image string is null or empty");
                        //     promise.reject("INVALID_BASE64_STRING", "Base64 image string is null or empty");
                        //     return;
                        // }

                        //  promise.resolve(Activity);

                        // Bitmap bitmap = decodeBase64(base64String);
                        // if (bitmap == null) {
                        //     Log.e(TAG, "DECODE CHECK NOT");
                        //     promise.reject("INVALID_BASE64_STRING", "DECODE CHECK NOT");
                        //     return;
                        // }

                        // Save Bitmap to file
                        // File file = saveBitmap(bitmap);

                        // // Resolve the promise with the file path
                        // promise.resolve(file.getAbsolutePath());
                        // promise.resolve("Try Get Usb");
                    } else {
                        promise.reject("Activity is null");
                    } 
                // String base64Image = bitmapToBase64(bitmap);

                // // Emitting the event to JavaScript
                // WritableMap params = Arguments.createMap();
                // params.putString("imageBase64", base64Image);

                // // Emitting the event to JavaScript
                // reactContext
                //     .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                //     .emit("ImageProcessedEvent", params);
            } catch (Exception e) {
                // Handle error
                Log.e(TAG, "Error saving bitmap to file", e);
                promise.reject("SAVE_BITMAP_ERROR", e.getMessage());
            }
        }

        // @ReactMethod
        // public void setImage(final String imagePath,Promise promise) {
        //     Activity activity = getCurrentActivity();
        //     if (activity == null) {
        //         return;
        //     }

        //     activity.runOnUiThread(new Runnable() {
        //         @Override
        //         public void run() {

        //             try {
        //                 // Decode the bitmap
        //                 Bitmap bitmap = BitmapFactory.decodeFile(imagePath);

        //                 // Update the UI on the main thread
        //                 ImageView imageView = activity.findViewById(R.id.imageFP);
        //                 if (imageView != null) {
        //                     imageView.setImageBitmap(bitmap);
        //                     promise.resolve("Image set successfully");
        //                 }else{
        //                     promise.reject("IMAGE_VIEW_NULL", "ImageView is null");
        //                 }
        //             }catch (Exception e) {
        //                 promise.reject("SET_IMAGE_ERROR", e.getMessage());
        //             }
        //         }
        //     });
        // }
            // @ReactMethod
            // public void captureAndSendImage(byte[] fpImage, int width, int height, Promise promise) {
            //     try {
            //         Bitmap bitmap = BitmapFactory.decodeByteArray(fpImage, 0, fpImage.length);
            //         if (bitmap == null) {
            //             promise.reject("INVALID_IMAGE", "Failed to decode image");
            //             return;
            //         }

            //         // Resize and compress the image
            //         Bitmap resizedBitmap = resizeBitmap(bitmap, 1024, 1024);  // Adjust max width/height as needed
            //         String base64String = bitmapToBase64(resizedBitmap);
                     
            //         // Send to React Native
            //         // sendBitmapToReactNative(base64String);
            //         WritableMap params = Arguments.createMap();
            //         params.putString("imageBase64", base64String);

            //         getReactApplicationContext()
            //             .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            //             .emit("ImageReceivedEvent", params);

            //         promise.resolve("Image sent successfully");
            //     } catch (Exception e) {
            //         Log.e(TAG, "Error processing image", e);
            //         promise.reject("PROCESSING_ERROR", e.getMessage());
            //     }
            // }
            // public Bitmap resizeBitmap(Bitmap bitmap, int maxWidth, int maxHeight) {
            //     int width = bitmap.getWidth();
            //     int height = bitmap.getHeight();

            //     float aspectRatio = (float) width / height;
            //     if (width > maxWidth || height > maxHeight) {
            //         if (width > height) {
            //             width = maxWidth;
            //             height = (int) (maxWidth / aspectRatio);
            //         } else {
            //             height = maxHeight;
            //             width = (int) (maxHeight * aspectRatio);
            //         }
            //     }
            //     return Bitmap.createScaledBitmap(bitmap, width, height, true);
            // }

            // public String bitmapToBase64(Bitmap bitmap) {
            //     ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
            //     bitmap.compress(Bitmap.CompressFormat.JPEG, 80, byteArrayOutputStream);  // Compressing to JPEG with 80% quality
            //     byte[] byteArray = byteArrayOutputStream.toByteArray();
            //     return Base64.encodeToString(byteArray, Base64.DEFAULT);
            // }

            // public Bitmap decodeBase64(String base64Image) {
            //     byte[] decodedBytes = Base64.decode(base64Image, Base64.DEFAULT);
            //     return BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.length);
            //     //  return decodedBytes;
            // }

            // private void sendBitmapToReactNative(String base64String) {
            //     WritableMap params = Arguments.createMap();
            //     params.putString("imageBase64", base64String);

            //     getReactApplicationContext()
            //         .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            //         .emit("ImageReceivedEvent", params);
            // }

            // Helper method to save Bitmap to a file
            private File saveBitmap(Bitmap bitmap) throws IOException {
                // Get the directory for the app's private pictures directory.
                File file = getOutputMediaFile();
                if (file == null) {
                    throw new IOException("Failed to create directory or file for saving image.");
                }

                FileOutputStream fos = new FileOutputStream(file);
                bitmap.compress(Bitmap.CompressFormat.PNG, 100, fos);
                fos.flush();
                fos.close();
                return file;
            }
            private File getOutputMediaFile() {
                File mediaStorageDir = new File(Environment.getExternalStoragePublicDirectory(
                        Environment.DIRECTORY_PICTURES), "MyApp");

                // Create the storage directory if it does not exist
                if (!mediaStorageDir.exists()) {
                    if (!mediaStorageDir.mkdirs()) {
                        Log.d(TAG, "failed to create directory");
                        return null;
                    }
                }

                // Create a media file name
                String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(new Date());
                File mediaFile;
                String mImageName = "MI_" + timeStamp + ".png";
                mediaFile = new File(mediaStorageDir.getPath() + File.separator + mImageName);
                return mediaFile;
            }

            @ReactMethod
            public void addListener(String eventName) {
                // Set up any upstream listeners or background tasks as necessary
            }

            // Add this method to support removeListeners in React Native
            @ReactMethod
            public void removeListeners(Integer count) {
                // Remove upstream listeners, stop unnecessary background tasks
            }


            // @ReactMethod
            // public void saveBitmapToFile(String base64Image, Promise promise) {
            //     try {
            //         // Convert Base64 string to Bitmap
            //         Bitmap bitmap = decodeBase64(base64Image);

            //         // Save Bitmap to file
            //         File file = saveBitmap(bitmap);

            //         // Resolve the promise with the file path
            //         promise.resolve(file.getAbsolutePath());
            //     } catch (Exception e) {
            //         Log.e(TAG, "Error saving bitmap to file", e);
            //         promise.reject("SAVE_BITMAP_ERROR", e.getMessage());
            //     }
            // }
            // private String bitmapToBase64(Bitmap bitmap) {
            //     ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
            //     bitmap.compress(Bitmap.CompressFormat.PNG, 100, byteArrayOutputStream);
            //     byte[] byteArray = byteArrayOutputStream.toByteArray();
            //     return Base64.encodeToString(byteArray, Base64.DEFAULT);
            // }
                // @ReactMethod
        // public void startFingerprintCapture(Promise promise) {
        //     try {
        //         MainActivity mainActivity = (MainActivity) getCurrentActivity();
        //         if (mainActivity != null) {
        //              mainActivity.fingerprintCaptureListener(new MainActivity.FingerprintCaptureListener() {
        //                 @Override
        //                 public void onCapture(String base64Image) {
        //                   WritableMap map = Arguments.createMap();
        //                     map.putString("base64Image", base64Image);
        //                     sendEventToReactNative("FingerprintCaptured", map);
        //                     promise.resolve("Fingerprint capture succeeded.");
        //                     // promise.resolve("Fingerprint capture succeeded.");
        //                 }

        //                 @Override
        //                 public void onError(String error) {
        //                     promise.reject("Fingerprint capture failed.", error);
        //                 }
        //             });
        //         } else {
        //             promise.reject("Error", "MainActivity is null.");
        //         }
        //     } catch (Exception e) {
        //         promise.reject("Error", e.toString());
        //     }
        // }

        // private void sendEventToReactNative(String eventName, WritableMap eventData) {
        //     if (reactContext != null) {
        //         reactContext
        //             .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
        //             .emit(eventName, eventData);
        //     }
        // }
        // @ReactMethod
        // public void doRegister(byte[] template, Promise promise) {

        //     MainActivity activity = (MainActivity) getCurrentActivity();
        //     if (activity != null) {
        //         activity.doRegister(template);
        //         // byte[] bufids = new byte[256];
        //         // int ret = ZKFingerService.identify(template, bufids, 70, 1);
        //         // if (ret > 0) {
        //         //     String strRes[] = new String(bufids).split("\t");
        //         //     promise.resolve("The finger is already enrolled by " + strRes[0] + ", cancel enrollment");
        //         //     bRegister = false;
        //         //     enroll_index = 0;
        //         //     return;
        //         // }
        //         // if (enroll_index > 0 && (ret = ZKFingerService.verify(regtemparray[enroll_index - 1], template)) <= 0) {
        //         //     promise.resolve("Please press the same finger 3 times for enrollment, cancel enrollment, score=" + ret);
        //         //     bRegister = false;
        //         //     enroll_index = 0;
        //         //     return;
        //         // }
        //         // System.arraycopy(template, 0, regtemparray[enroll_index], 0, 2048);
        //         // enroll_index++;
        //         // if (enroll_index == ENROLL_COUNT) {
        //         //     bRegister = false;
        //         //     enroll_index = 0;
        //         //     byte[] regTemp = new byte[2048];
        //         //     if (0 < (ret = ZKFingerService.merge(regtemparray[0], regtemparray[1], regtemparray[2], regTemp))) {
        //         //         int retVal = ZKFingerService.save(regTemp, strUid);
        //         //         if (0 == retVal) {
        //         //             String strFeature = Base64.encodeToString(regTemp, 0, ret, Base64.NO_WRAP);
        //         //             dbManager.insertUser(strUid, strFeature);
        //         //             promise.resolve("Enrollment successful");
        //         //         } else {
        //         //             promise.resolve("Enrollment failed, template addition failed, ret=" + retVal);
        //         //         }
        //         //     } else {
        //         //         promise.resolve("Enrollment failed");
        //         //     }
        //         //     bRegister = false;
        //         // } else {
        //         //     promise.resolve("You need to press the " + (ENROLL_COUNT - enroll_index) + " times fingerprint");
        //         // }

        //      } else {
        //         promise.reject("Activity is null");
        //     }
        // }
        // @ReactMethod
        // public void doIdentify(byte[] template, Promise promise) {

        //     MainActivity activity = (MainActivity) getCurrentActivity();
        //     if (activity != null) {
        //         activity.doIdentify(template);
               
        //      } else {
        //         promise.reject("Activity is null");
        //     }
        // }
        @ReactMethod
        public FingerprintCaptureListener fingerprintCaptureListener = new FingerprintCaptureListener() {


            @ReactMethod
            public void captureOK(byte[] fpImage) {
                
                 MainActivity activity = (MainActivity) getCurrentActivity();
                if(activity != null){

                    
                    final Bitmap bitmap = ToolUtils.renderCroppedGreyScaleBitmap(fpImage, fingerprintSensor.getImageWidth(), fingerprintSensor.getImageHeight());
                    // reactContext.runOnUiQueueThread(new Runnable() {
                    //     public void run() {
                    //         imageView.setImageBitmap(bitmap); // Ensure imageView is initialized properly
                    //     }
                    // });

                    ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
                    bitmap.compress(Bitmap.CompressFormat.PNG, 100, byteArrayOutputStream);
                    byte[] byteArray = byteArrayOutputStream.toByteArray();
                    String base64Image = Base64.encodeToString(byteArray, Base64.DEFAULT);
                }

                // return base64Image;
            }

           @ReactMethod
            public void captureError(FingerprintException e) {
                // Handle error
            }

           @ReactMethod
            public void extractOK(byte[] fpTemplate) {

                 MainActivity activity = (MainActivity) getCurrentActivity();
                if (activity != null) {
                    if (bRegister) {
                       activity.doRegister(fpTemplate);
                    } else {
                        activity.doIdentify(fpTemplate);
                    }
                }
            }

            @Override
            public void extractError(int i) {
                // Handle error
            }
        };

        @ReactMethod
        public void initializeImageView(int viewId, Callback successCallback, Callback errorCallback,Promise promise) {
            try {
                MainActivity activity = (MainActivity) getCurrentActivity();

                // fingerprintSensor.setFingerprintCaptureListener(new FingerprintCaptureListener  () {

                //     public void onCaptureSuccess(Bitmap bitmap) {
                //         UiThreadUtil.runOnUiThread(new Runnable() {
                //             @Override
                //             public void run() {
                //                 // Process bitmap if needed
                //                 // Convert bitmap to Base64 string to send it back to React Native
                //                 String base64Image = bitmapToBase64(bitmap);
                //                 promise.resolve(base64Image);
                //             }
                //         });
                //     }

                    
                //     public void onCaptureFailure(String error) {
                //         UiThreadUtil.runOnUiThread(new Runnable() {
                //             @Override
                //             public void run() {
                //                 promise.reject("CAPTURE_ERROR", error);
                //             }
                //         });
                //     }
                // });
                
                 
            } catch (Exception e) {
                errorCallback.invoke(e.getMessage());
            }
        }

       @ReactMethod
        public void onBnStart(Promise promise) {
            // Call the method that uses the View parameter
            MainActivity activity = (MainActivity) getCurrentActivity();

           
            if (activity != null) {
                if (bStarted) {
                    promise.resolve("Device already connected!");
                    return;
                }

                if (!activity.enumSensor()) {
                    // activity.createFingerprintSensor();
                    // promise.resolve("Device");
                    
                    return;
                }
                // onBnStartInternal(null, promise);
                activity.tryGetUSBPermission();
            }
        }

        // private String bitmapToBase64(Bitmap bitmap) {
        //     ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        //     bitmap.compress(Bitmap.CompressFormat.PNG, 100, byteArrayOutputStream);
        //     byte[] byteArray = byteArrayOutputStream.toByteArray();
        //     return Base64.encodeToString(byteArray, Base64.DEFAULT);
        // }
        // @ReactMethod
        // private void initializeFingerprintSensor() {
        //     fingerprintSensor = new FingerprintSensor(); // Initialize as needed
        //     fingerprintSensor.setExceptionListener(fingerprintExceptionListener);
        // }
        
        // @ReactMethod
        // public FingerprintExceptionListener fingerprintExceptionListener = new FingerprintExceptionListener() {
        //     @Override
        //     public void onDeviceException() {
        //         LogHelper.e("usb exception!!!");
        //         if (!isReseted) {
        //             try {
        //                 fingerprintSensor.openAndReboot(deviceIndex);
        //             } catch (FingerprintException e) {
        //                 e.printStackTrace();
        //             }
        //             isReseted = true;
        //         }
        //     }
        // };

        // public void initUI(View view) {
        //     textView = view.findViewById(R.id.txtResult);
        //     editText = view.findViewById(R.id.editID);
        //     imageView = view.findViewById(R.id.imageFP);
        // }

        
        // @ReactMethod
        // public void checkStoragePermission(Promise promise) {
        //     MainActivity activity = (MainActivity) getCurrentActivity();
        //     if (activity != null) {
        //         activity.checkStoragePermission();
        //         promise.resolve("Storage Permission successfully");
        //     } else {
        //         promise.reject("Activity is null");
        //     }
        // }

        // @ReactMethod
        // public void initUi(Promise promise) {
        // // Call the method that uses the View parameter
        //     MainActivity activity = (MainActivity) getCurrentActivity();
        //     if (activity != null) {
        //         activity.initUI();
        //     }
        // }



            @ReactMethod
    public void captureFingerprint() {
        // Capture fingerprint and handle the data
    }


         @ReactMethod
        public void createFingerprintSensor(Promise promise) {
            // Call the method that uses the View parameter
            MainActivity activity = (MainActivity) getCurrentActivity();

           
            if (activity != null) {
               activity.createFingerprintSensor();
               promise.resolve("Finerprint Sensor");
                // onBnStartInternal(null, promise);
                // activity.tryGetUSBPermission();
            }
        }

         

        @ReactMethod
        private ZKUSBManagerListener zkusbManagerListener = new ZKUSBManagerListener() {
            //    @Override
            public void onCheckPermission(int result) {
                MainActivity activity = (MainActivity) getCurrentActivity();
                if (activity != null) {
                    activity.afterGetUsbPermission();
                    // promise.resolve("After Get USB");
                } 
            }

            //    @Override
            public void onUSBArrived(UsbDevice device) {
                if (bStarted)
                {
                    MainActivity activity = (MainActivity) getCurrentActivity();
                    if (activity != null) {
                        activity.closeDevice();
                        activity.tryGetUSBPermission();
                        // promise.resolve("After Get USB");
                    } 
                 
                }
            }

            //    @Override
            public void onUSBRemoved(UsbDevice device) {
                LogHelper.d("usb removed!");
            }
        };

        public void createFingerprintSensor(Context applicationContext) {
            if (fingerprintSensor != null) {
                FingprintFactory.destroy(fingerprintSensor);
                fingerprintSensor = null;
            }

            // Define output log level
            LogHelper.setLevel(Log.VERBOSE);
            LogHelper.setNDKLogLevel(Log.ASSERT);

            // Start fingerprint sensor
            Map<String, Object> deviceParams = new HashMap<>();
            // Set VID and PID for USB connection
            deviceParams.put(ParameterHelper.PARAM_KEY_VID, usb_vid);
            deviceParams.put(ParameterHelper.PARAM_KEY_PID, usb_pid);

            // Create fingerprint sensor instance
            fingerprintSensor = FingprintFactory.createFingerprintSensor(applicationContext, TransportType.USB, deviceParams);
        }


    //     @ReactMethod
    //     public void showToast(String message, Promise promise) {
    //         MainActivity activity = (MainActivity) getCurrentActivity();
    //         if (activity != null) {
    //             activity.showToast(message);
    //             promise.resolve("Toast shown successfully");
    //         } else {
    //             promise.reject("Activity is null");
    //         }
    //     }
        
    //      @ReactMethod
    //     public void openDevice(Promise promise) {
    //         MainActivity activity = (MainActivity) getCurrentActivity();
    //         if (activity != null) {
    //             activity.openDevice();
    //             promise.resolve("Toast shown successfully");
    //         } else {
    //             promise.reject("Activity is null");
    //         }
    //     }
    //      @ReactMethod
    //     public void createFingerprintSensor(Promise promise) {
    //         MainActivity activity = (MainActivity) getCurrentActivity();
    //         if (activity != null) {
    //             activity.createFingerprintSensor();
    //             promise.resolve("Toast shown successfully");
    //         } else {
    //             promise.reject("Activity is null");
    //         }
    //     }
      
    //      @ReactMethod
    //     public void enumSensor(Promise promise) {
    //         MainActivity activity = (MainActivity) getCurrentActivity();
    //         if (activity != null) {
    //             activity.enumSensor();
    //             promise.resolve("Toast shown successfully");
    //         } else {
    //             promise.reject("Activity is null");
    //         }
    //     }
    //      @ReactMethod
    //     public void tryGetUSBPermission(Promise promise) {
    //         MainActivity activity = (MainActivity) getCurrentActivity();
    //         if (activity != null) {
    //             activity.tryGetUSBPermission();
    //             promise.resolve("Toast shown successfully");
    //         } else {
    //             promise.reject("Activity is null");
    //         }
    //     }
    //      @ReactMethod
    //     public void afterGetUsbPermission(Promise promise) {
    //         MainActivity activity = (MainActivity) getCurrentActivity();
    //         if (activity != null) {
    //             activity.afterGetUsbPermission();
    //             promise.resolve("Toast shown successfully");
    //         } else {
    //             promise.reject("Activity is null");
    //         }
    //     }
       
    //   @ReactMethod
    //   public void onBnStart(Promise promise) {
    //    // Call the method that uses the View parameter
    //     MainActivity activity = (MainActivity) getCurrentActivity();
    //       if (activity != null) {
    //           onBnStartInternal(null, promise);
    //       }
    //   }

    //   // Method that accepts a View parameter and uses a Promise
    //   private void onBnStartInternal(View view, Promise promise) {
    //       // Your code here
    //       try {
    //           // Perform your operation here
    //           promise.resolve("Operation completed successfully");
    //       } catch (Exception e) {
    //           promise.reject("Error", e);
    //       }
    //   }

    // @ReactMethod
    // public void initialize(Promise promise) {
    //     // try {
    //     //     if (getCurrentActivity() != null) {
    //     //         dbFileName = getCurrentActivity().getFilesDir().getAbsolutePath() + "/zkfinger10.db";
    //     //         initUI();
    //     //         checkStoragePermission();
    //     //         zkusbManager = new ZKUSBManager(getCurrentActivity().getApplicationContext(), zkusbManagerListener);
    //     //         zkusbManager.registerUSBPermissionReceiver();
    //     //         promise.resolve("Initialization successful");
    //     //     } else {
    //     //         promise.reject("Activity is null");
    //     //     }
    //     // } catch (Exception e) {
    //     //     promise.reject("Initialization failed", e);
    //     // }
    //     try {
    //         if (getCurrentActivity() != null) {
    //             Context context = getCurrentActivity().getApplicationContext();
    //             dbFileName = context.getFilesDir().getAbsolutePath() + "/zkfinger10.db";
    //             initUI(promise);
    //             checkStoragePermission(promise);
    //             zkusbManager = new ZKUSBManager(context, zkusbManagerListener);
    //             zkusbManager.registerUSBPermissionReceiver();
    //             promise.resolve("Initialization successful");
    //         } else {
    //             promise.reject("Activity is null");
    //         }
    //     } catch (Exception e) {
    //         promise.reject("Initialization failed", e);
    //     }
    // }
    

    // @ReactMethod
    // public void initUI(Promise promise) {
    //     try {
    //         // You may need to run this on the main thread
    //         if (getCurrentActivity() != null) {
    //             getCurrentActivity().runOnUiThread(new Runnable() {
    //                 @Override
    //                 public void run() {
    //                     textView = getCurrentActivity().findViewById(R.id.txtResult);
    //                     editText = getCurrentActivity().findViewById(R.id.editID);
    //                     imageView = getCurrentActivity().findViewById(R.id.imageFP);
    //                 }
    //             });
    //         }
    //         promise.resolve("UI Initialized");
    //     } catch (Exception e) {
    //         promise.reject("Error initializing UI", e);
    //     }
    // }

    // @ReactMethod
    //     public void checkStoragePermission(Promise promise) {
    //         MainActivity activity = (MainActivity) getCurrentActivity();
    //         if (activity != null) {
    //             activity.checkStoragePermission();
    //             promise.resolve("Toast shown successfully");
    //         } else {
    //             promise.reject("Activity is null");
    //         }
    //     }

    // @ReactMethod
    // public void setTextViewText(String text, Promise promise) {
    //     if (textView != null) {
    //         textView.setText(text);
    //         promise.resolve("Text set");
    //     } else {
    //         promise.reject("TextView not initialized");
    //     }
    // }

    // @ReactMethod
    // public void setEditText(String text, Promise promise) {
    //     if (editText != null) {
    //         editText.setText(text);
    //         promise.resolve("Text set");
    //     } else {
    //         promise.reject("EditText not initialized");
    //     }
    // }

    // @ReactMethod
    // public void setImageViewResource(int resourceId, Promise promise) {
    //     if (imageView != null) {
    //         imageView.setImageResource(resourceId);
    //         promise.resolve("Image set");
    //     } else {
    //         promise.reject("ImageView not initialized");
    //     }
    // }

    
// private UsbManager usbManager;
//     private ReactApplicationContext reactContext;
    

   @Override
    public String getName() {
        return "ZKTecoModule";
    }

  // // private void initUI()
  // // {
  // //   textView = (TextView)findViewById(R.id.txtResult);
  // //   editText = (EditText)findViewById(R.id.editID);
  // //   imageView = (ImageView)findViewById(R.id.imageFP);
  // // }

  // // /**
  // //  * storage permission
  // //  */
  // // private void checkStoragePermission(Promise promise) {
   
  // //   String[] permission = new String[]{
  // //               Manifest.permission.READ_EXTERNAL_STORAGE,
  // //               Manifest.permission.WRITE_EXTERNAL_STORAGE
  // //             };
  // //            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
  // //                 if (ContextCompat.checkSelfPermission(getReactApplicationContext(), Manifest.permission.USB_PERMISSION) != PackageManager.PERMISSION_GRANTED) {
  // //                     ActivityCompat.requestPermissions(getCurrentActivity(), new String[]{Manifest.permission.USB_PERMISSION});
  // //                     promise.resolve("Permission requested");
  // //                 } else {
  // //                     promise.resolve("Permission already granted");
  // //                 }
  // //             } else {
  // //                 promise.resolve("No permission required for SDK < M");
  // //             }
  // // }


  // // @Override
  // // public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
  // //   super.onRequestPermissionsResult(requestCode, permissions, grantResults);
  // //   switch (requestCode) {
  // //     case REQUEST_PERMISSION_CODE:
  // //       boolean granted = true;
  // //       for (int result : grantResults) {
  // //         if (result != PackageManager.PERMISSION_GRANTED) {
  // //           granted = false;
  // //         }
  // //       }
  // //       if (granted) {
  // //         ToastAndroid.(this, "Permission granted", Toast.LENGTH_SHORT).show();
  // //       } else {
  // //         Toast.makeText(this, "Permission Denied,The application can't run on this device", Toast.LENGTH_SHORT).show();
  // //       }
  // //     default:
  // //       break;
  // //   }
  // // }


  


  //    private static final int ZKTECO_VID =   0x1b55;
  //       private static final int LIVE20R_PID =   0x0120;
  //       private static final int LIVE10R_PID =   0x0124;
  //       private static final String TAG = "MainActivity";
  //       private final int REQUEST_PERMISSION_CODE = 9;
  //       private ZKUSBManager zkusbManager = null;
  //       private FingerprintSensor fingerprintSensor = null;
  //       private TextView textView = null;
  //       private EditText editText = null;
  //       private ImageView imageView = null;
  //       private int usb_vid = ZKTECO_VID;
  //       private int usb_pid = 0;
  //       private boolean bStarted = false;
  //       private int deviceIndex = 0;
  //       private boolean isReseted = false;
  //       // fingerprintSensor = FingerprintFactory.createFingerprintSensor(this.getApplicationContext());
  //       private String strUid = null;
  //       private final static int ENROLL_COUNT   =   3;
  //       private int enroll_index = 0;
  //       private byte[][] regtemparray = new byte[3][2048];  //register template buffer array
  //       private boolean bRegister = false;
  //       private DBManager dbManager = new DBManager();
  //       private String dbFileName;
    

  //   // @ReactMethod
  //   // public void createCalendarEvent(String name, String location) {
  //   //   Log.d("CalendarModule", "Create event called with name: " + name
  //   //   + " and location: " + location);
  //   // }
   


  //   private FingerprintCaptureListener fingerprintCaptureListener = new FingerprintCaptureListener() {
  //     @Override
  //     public void captureOK(byte[] fpImage) {
  //       final Bitmap bitmap = ToolUtils.renderCroppedGreyScaleBitmap(fpImage, fingerprintSensor.getImageWidth(), fingerprintSensor.getImageHeight());
  //       // runOnUiThread(new Runnable() {
  //       //   public void run() {
  //       //     imageView.setImageBitmap(bitmap);
  //       //   }
  //       // });
  //     }

  //     @Override
  //     public void captureError(FingerprintException e) {
  //       // nothing to do
  //     }

  //     @Override
  //     public void extractOK(byte[] fpTemplate) {
  //       if (bRegister)
  //       {
  //         doRegister(fpTemplate);
  //       }
  //       else
  //       {
  //         doIdentify(fpTemplate);
  //       }
  //     }

  //     @Override
  //     public void extractError(int i) {
  //       // nothing to do
  //     }
  //   };

  //   private FingerprintExceptionListener fingerprintExceptionListener = new FingerprintExceptionListener() {
  //     @Override
  //     public void onDeviceException() {
  //       LogHelper.e("usb exception!!!");
  //       if (!isReseted) {
  //         try {
  //           fingerprintSensor.openAndReboot(deviceIndex);
  //         } catch (FingerprintException e) {
  //           e.printStackTrace();
  //         }
  //         isReseted = true;
  //       }
  //     }
  //   };

  //     private ZKUSBManagerListener zkusbManagerListener = new ZKUSBManagerListener() {
  //       //    @Override
  //       public void onCheckPermission(int result) {
  //         afterGetUsbPermission();
  //       }

  //       //    @Override
  //       public void onUSBArrived(UsbDevice device) {
  //         if (bStarted)
  //         {
  //           closeDevice();
  //           tryGetUSBPermission();
  //         }
  //       }

  //       //    @Override
  //       public void onUSBRemoved(UsbDevice device) {
  //         LogHelper.d("usb removed!");
  //       }
  //     };

  //     @ReactMethod 
  //     private void tryGetUSBPermission() {
  //       zkusbManager.initUSBPermission(usb_vid, usb_pid);
  //     }
  //     @ReactMethod 
  //     private void afterGetUsbPermission()
  //     {
  //       openDevice();
  //     }
  //     @ReactMethod 
  //     private void openDevice()
  //     {
  //       createFingerprintSensor();
  //       bRegister = false;
  //       enroll_index = 0;
  //       isReseted = false;
  //       try {
  //         //fingerprintSensor.setCaptureMode(1);
  //         fingerprintSensor.open(deviceIndex);
  //         //load all templates form db
  //         if (dbManager.opendb(dbFileName) && dbManager.getCount() > 0)
  //         {
  //           HashMap<String, String> vUserList;
  //           vUserList = dbManager.queryUserList();
  //           int ret = 0;
  //           if (vUserList.size() > 0)
  //           {
  //             for (Map.Entry<String, String> entry : vUserList.entrySet()) {
  //               String strID = entry.getKey();
  //               String strFeature = entry.getValue();
  //               byte[] blobFeature = Base64.decode(strFeature, Base64.NO_WRAP);
  //               ret = ZKFingerService.save(blobFeature, strID);
  //               if (0 != ret)
  //               {
  //                 LogHelper.e("add [" + strID + "] template failed, ret=" + ret);
  //               }
  //             }
  //           }
  //         }
  //         {
  //           // device parameter
  //           LogHelper.d("sdk version" + fingerprintSensor.getSDK_Version());
  //           LogHelper.d("firmware version" + fingerprintSensor.getFirmwareVersion());
  //           LogHelper.d("serial:" + fingerprintSensor.getStrSerialNumber());
  //           LogHelper.d("width=" + fingerprintSensor.getImageWidth() + ", height=" + fingerprintSensor.getImageHeight());
  //         }
  //         fingerprintSensor.setFingerprintCaptureListener(deviceIndex, fingerprintCaptureListener);
  //         fingerprintSensor.SetFingerprintExceptionListener(fingerprintExceptionListener);
  //         fingerprintSensor.startCapture(deviceIndex);
  //         bStarted = true;
  //         textView.setText("connect success!");
  //       } catch (FingerprintException e) {
  //         e.printStackTrace();
  //         // try to  reboot the sensor
  //         try {
  //           fingerprintSensor.openAndReboot(deviceIndex);
  //         } catch (FingerprintException ex) {
  //           ex.printStackTrace();
  //         }
  //         textView.setText("connect failed!");
  //       }
  //     }

  //     @ReactMethod
  //     private void closeDevice()
  //     {
  //       if (bStarted)
  //       {
  //         try {
  //           fingerprintSensor.stopCapture(deviceIndex);
  //           fingerprintSensor.close(deviceIndex);
  //         } catch (FingerprintException e) {
  //           e.printStackTrace();
  //         }
  //         bStarted = false;
  //       }
  //     }

  //     @ReactMethod
  //     private void createFingerprintSensor()
  //     {
  //       if (null != fingerprintSensor)
  //       {
  //         FingprintFactory.destroy(fingerprintSensor);
  //         fingerprintSensor = null;
  //       }
  //       // Define output log level
  //       LogHelper.setLevel(Log.VERBOSE);
  //       LogHelper.setNDKLogLevel(Log.ASSERT);
  //       // Start fingerprint sensor
  //       Map deviceParams = new HashMap();
  //       //set vid
  //       deviceParams.put(ParameterHelper.PARAM_KEY_VID, usb_vid);
  //       //set pid
  //       deviceParams.put(ParameterHelper.PARAM_KEY_PID, usb_pid);
  //       fingerprintSensor = FingprintFactory.createFingerprintSensor(null,TransportType.USB, deviceParams);
  //     }

   
  //       // @ReactMethod
  //       // public void onCreate(Bundle savedInstanceState) {
  //       //   super(savedInstanceState);
  //       //   // setContentView(R.layout.activity_main);
  //       //   // dbFileName = getFilesDir().getAbsolutePath() + "/zkfinger10.db";
  //       //   // initUI();
  //       //   // checkStoragePermission();
  //       //   zkusbManager = new ZKUSBManager(this.getApplicationContext(), zkusbManagerListener);
  //       //   zkusbManager.registerUSBPermissionReceiver();
  //       // }

  //       //   @ReactMethod
  //       //    private boolean enumSensor()
  //       // {

  //       //     usbManager = (UsbManager) getSystemService(Context.USB_SERVICE);
  //       //     for (UsbDevice device : usbManager.getDeviceList().values()) {
  //       //         int device_vid = device.getVendorId();
  //       //         int device_pid = device.getProductId();
  //       //         if (device_vid == ZKTECO_VID && (device_pid == LIVE20R_PID || device_pid == LIVE10R_PID))
  //       //         {
  //       //             usb_pid = device_pid;
  //       //             return true;
  //       //         }
  //       //     }
  //       //     return false;
  //       // }

      
//   //   @ReactMethod 
//     public void doRegister(byte[] template)
//     {
//       byte[] bufids = new byte[256];
//       int ret = ZKFingerService.identify(template, bufids, 70, 1);
//       if (ret > 0)
//       {
//         String strRes[] = new String(bufids).split("\t");

//         // Intent data = new Intent();
//         // this.setResult(Activity.RESULT_OK, "the finger already enroll by " + strRes[0] + ",cancel enroll");
//         // getActivity().finish();
//         setResult("the finger already enroll by " + strRes[0] + ",cancel enroll");
//         bRegister = false;
//         enroll_index = 0;
//         return;
//       }
//       if (enroll_index > 0 && (ret = ZKFingerService.verify(regtemparray[enroll_index-1], template)) <= 0)
//       {
//         setResult("please press the same finger 3 times for the enrollment, cancel enroll, socre=" + ret);
//         bRegister = false;
//         enroll_index = 0;
//         return;
//       }
//       System.arraycopy(template, 0, regtemparray[enroll_index], 0, 2048);
//       enroll_index++;
//       if (enroll_index == ENROLL_COUNT) {
//         bRegister = false;
//         enroll_index = 0;
//         byte[] regTemp = new byte[2048];
//         if (0 < (ret = ZKFingerService.merge(regtemparray[0], regtemparray[1], regtemparray[2], regTemp))) {
//           int retVal = 0;
//           retVal = ZKFingerService.save(regTemp, strUid);
//           if (0 == retVal)
//           {
//             String strFeature = Base64.encodeToString(regTemp, 0, ret, Base64.NO_WRAP);
//             dbManager.insertUser(strUid, strFeature);
//             setResult("enroll succ");
//           }
//           else
//           {
//             setResult("enroll fail, add template fail, ret=" + retVal);
//           }
//         } else {
//           setResult("enroll fail");
//         }
//         bRegister = false;
//       } else {
//         setResult("You need to press the " + (3 - enroll_index) + " times fingerprint");
//       }
//     }
//     @ReactMethod
//    public void doIdentify(byte[] template)
//     {
//         byte[] bufids = new byte[256];
//         int ret = ZKFingerService.identify(template, bufids, 70, 1);
//         if (ret > 0) {
//             String strRes[] = new String(bufids).split("\t");
//             setResult("identify succ, userid:" + strRes[0].trim() + ", score:" + strRes[1].trim());
//         } else {
//             setResult("identify fail, ret=" + ret);
//         }
//     }
    

  //     @ReactMethod
  //     public void onBnStart()
  //     {
  //       if (bStarted)
  //       {
  //         textView.setText("Device already connected!");
  //         return;
  //       }
  //       // if (!enumSensor())
  //       // {
  //       //   textView.setText("Device not found!");
  //       //   return;
  //       // }
  //       tryGetUSBPermission();
  //     }

  //     @ReactMethod
  //     public void onBnStop(View view)
  //     {
  //       if (!bStarted)
  //       {
  //         textView.setText("Device not connected!");
  //         return;
  //       }
  //       closeDevice();
  //       textView.setText("Device closed!");
  //     }
  //     @ReactMethod
  //     public void onBnRegister(View view)
  //     {
  //       if (bStarted) {
  //         strUid = editText.getText().toString();
  //         if (null == strUid || strUid.isEmpty()) {
  //           textView.setText("Please input your user id");
  //           bRegister = false;
  //           return;
  //         }
  //         if (dbManager.isUserExited(strUid)) {
  //           bRegister = false;
  //           textView.setText("The user[" + strUid + "] had registered!");
  //           return;
  //         }
  //         bRegister = true;
  //         enroll_index = 0;
  //         textView.setText("Please press your finger 3 times.");
  //       } else {
  //         textView.setText("Please start capture first");
  //       }
  //     }

  //     @ReactMethod
  //     public void onBnIdentify(View view)
  //     {
  //       if (bStarted) {
  //         bRegister = false;
  //         enroll_index = 0;
  //       } else {
  //         textView.setText("Please start capture first");
  //       }
  //     }
    //   @ReactMethod
    //   public void setResult(String result)
    //   {
    //     final String mStrText = result;
    //     // runOnUiThread(new Runnable() {
    //     //   @Override
    //     //   public void run() {
    //     //     textView.setText(mStrText);
    //     //   }
    //     // });
    //   }
  //     @ReactMethod
  //     public void onBnDelete(View view)
  //     {
  //       if (bStarted) {
  //         strUid = editText.getText().toString();
  //         if (null == strUid || strUid.isEmpty()) {
  //           textView.setText("Please input your user id");
  //           return;
  //         }
  //         if (!dbManager.isUserExited(strUid)) {
  //           textView.setText("The user no registered");
  //           return;
  //         }
  //         // new AlertDialog.Builder(this)
  //                 // .setTitle("Do you want to delete the user ?")
  //                 // .setIcon(android.R.drawable.ic_dialog_info)
  //                 // .setPositiveButton("Yes", new DialogInterface.OnClickListener() {
  //                 //   @Override
  //                 //   public void onClick(DialogInterface dialog, int which) {
  //                 //     if (dbManager.deleteUser(strUid)) {
  //                 //       ZKFingerService.del(strUid);
  //                 //       setResult("Delete success !");
  //                 //     } else {
  //                 //       setResult("Open db fail !");
  //                 //     }
  //                 //   }
  //                 // })
  //                 // .setNegativeButton("No", new DialogInterface.OnClickListener() {
  //                 //   @Override
  //                 //   public void onClick(DialogInterface dialog, int which) {
  //                 //   }
  //                 // }).show();
  //       }
  //     }
  //     @ReactMethod
  //     public void onBnClear(View view)
  //     {
  //       if (bStarted) {
  //         // new AlertDialog.Builder(this)
  //                 // .setTitle("Do you want to delete all the users ?")
  //                 // .setIcon(android.R.drawable.ic_dialog_info)
  //                 // .setPositiveButton("Yes", new DialogInterface.OnClickListener() {
  //                 //   @Override
  //                 //   public void onClick(DialogInterface dialog, int which) {
  //                 //     if (dbManager.clear()) {
  //                 //       ZKFingerService.clear();
  //                 //       setResult("Clear success！");
  //                 //     } else {
  //                 //       setResult("Open db fail！");
  //                 //     }
  //                 //   }
  //                 // })
  //                 // .setNegativeButton("no", new DialogInterface.OnClickListener() {
  //                 //   @Override
  //                 //   public void onClick(DialogInterface dialog, int which) {

  //                 //   }
  //                 // })
  //                 // .show();
  //       }
  //     }

  //   // @Override
  //     @ReactMethod
  //     protected void onDestroy() {
  //       // super();
  //       if (bStarted)
  //       {
  //         closeDevice();
  //       }
  //       zkusbManager.unRegisterUSBPermissionReceiver();
  //     }
  
}