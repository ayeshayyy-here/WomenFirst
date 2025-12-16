import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  PermissionsAndroid,
  ToastAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Sound from 'react-native-sound';
import AudioRecord from 'react-native-audio-record';
import {Buffer} from 'buffer';
import * as RNFS from 'react-native-fs';


const AudioRecorder = ({ navigation, route, onAudioRecorded }) => {
  const [sound, setSound] = useState(null);
  const [startRecording, setStartRecording] = useState(false);
  const [audioFile, setAudioFile] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [paused, setPaused] = useState(true);
  const [audioPath, setAudioPath] = useState('');
  const [recording, setRecording] = useState(false);
  const [base64PathAudio, setBase64PathAudio] = useState('');
  const [recordedAudio, setRecordedAudio] = useState(null);


  useEffect(() => {
    initializeRecordingAudio();
  }, []);



  const initializeRecordingAudio = async () => {
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        console.log('write external stroage', grants);

        if (
          (grants['android.permission.WRITE_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
            grants['android.permission.READ_EXTERNAL_STORAGE'] ===
              PermissionsAndroid.RESULTS.GRANTED &&
            grants['android.permission.RECORD_AUDIO'] ===
              PermissionsAndroid.RESULTS.GRANTED) ||
          (grants['android.permission.READ_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN &&
            grants['android.permission.WRITE_EXTERNAL_STORAGE'] ===
              PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN)
        ) {
          ToastAndroid.show('permissions granted', ToastAndroid.LONG);
        } else {
          ToastAndroid.show(
            'All required permissions not granted',
            ToastAndroid.LONG,
          );

          return;
        }
      } catch (err) {
        console.warn(err);
        ToastAndroid.show(err, ToastAndroid.LONG);
        return;
      }
    }
    const options = {
      sampleRate: 16000,
      channels: 1,
      bitsPerSample: 16,
      wavFile: 'Audio.wav',
    };

    AudioRecord.init(options);
    AudioRecord.on('data', data => {
      // console.log('Data', data)
      setBase64PathAudio(data);
      const chunk = Buffer.from(data, 'base64');
      // console.log('Chunk size', chunk.byteLength);
    });
  };
  //open gallery

  //record audio
  const startAudio = () => {
    setStartRecording(true);
    //   console.log('Recording started');
    setAudioFile('');
    setLoaded(false);
    setRecording(true);
    AudioRecord.start();
  };
  const handleRemoveAudio = () => {
    if (sound) {
      sound.stop();
      sound.release();
    }

    setAudioFile('');
  };
 // Inside onStopRecord function
 const onStopRecord = async () => {
  if (!recording) {
    return;
  }
  console.log('Stop record');
  let audiofile = await AudioRecord.stop().then(r => {
    setAudioFile(r);
    RNFS.readFile(r, 'base64').then(data => {
      console.log('Data', data);
      setRecording(false);
      setStartRecording(false);
      setAudioPath(data);
      // Call the callback function with the recorded audio data
      onAudioRecorded(data);
    });
  });
  console.log('Audio File', audioPath);
};



  const load = () => {
    return new Promise((resolve, reject) => {
      if (!audioFile) return reject('Audio file is empty. ');
      const soundObject = new Sound(audioFile, '', error => {
        if (error) {
          console.log('Failed to load the file:', error);
          reject(error);
        } else {
          setLoaded(true);

          console.log('Sound Object', soundObject);
          setSound(soundObject);
          resolve();
        }
      });
    });
  };
  const play = async () => {
    console.log('Audio File', audioFile);
    if (!loaded) {
      try {
        await load();
      } catch (error) {
        console.log('Play error', error);
      }
    }
    setPaused(false);
  };

  useEffect(() => {
    if (sound && !paused) {
      Sound.setCategory('Playback');
      sound.play(success => {
        if (success) {
          console.log('Successfully played.');
        } else {
          console.log('Error playing sound, decoding error');
        }
        setPaused(true);
      });
    }
  }, [sound, paused]);

  return (
    <ScrollView contentContainerStyle={{flexGrow: 1}}>
      <View style={styles.container}>

        <View style={{flex: 1, padding: '5%'}}>          
            <View>
              <View style={styles.iconsContainer}>
                <TouchableOpacity
                  onPressIn={startAudio}
                  onPressOut={() => {
                    onStopRecord();
                  }}>
                  <View style={{alignItems: 'center'}}>
                    {!startRecording ? (
                      <Icon
                        name="microphone"
                        size={30}
                        style={{color: 'black'}}></Icon>
                    ) : (
                      <Icon
                        name="microphone"
                        size={30}
                        style={{color: '#69BE28'}}></Icon>
                    )}
                    {/* <Text style={{ color: "#000000", fontSize: 12, marginLeft: -15 }}>Voice</Text> */}
                  </View>
                </TouchableOpacity>


              </View>
              {/* to display recorded audio */}
              {recording == true ? (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'center',
                  }}>
                  <Icon
                    name="volume-down"
                    size={20}
                    style={{color: '#003060'}}></Icon>
                  <View style={{flex: 0.1}}></View>
                  <Text style={{fontWeight: '700', color: '#003060'}}>
                    Recording Audio...
                  </Text>
                </View>
              ) : null}
              {audioFile != '' ? (
                <View
                  style={{
                    marginTop: '5%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row',
                    alignSelf: 'center',
                  }}>
                  <TouchableOpacity
                    onPress={play}
                    style={{
                      // borderWidth: 1,
                      borderColor: '#003060',
                      // borderRadius: 14,
                      flex: 1,
                      height: 50,
                      marginHorizontal: 10,
                    }}>
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: 'space-evenly',
                        alignItems: 'center',
                      }}>
                      <Icon
                        name="volume-up"
                        size={15}
                        style={{color: '#003060'}}
                      />
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: '700',
                          color: '#003060',
                        }}>
                        Play Audio
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <View style={{flex: 0.1}}></View>
                  <TouchableOpacity
                    onPress={() => {
                      handleRemoveAudio();
                    }}
                    style={{
                      // borderWidth: 1,
                      borderColor: 'red',
                      // borderRadius: 14,
                      flex: 1,
                      height: 50,
                      marginHorizontal: 10,
                    }}>
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: 'space-evenly',
                        alignItems: 'center',
                      }}>
                      <Icon name="trash" size={15} style={{color: 'red'}} />
                      <Text
                        style={{fontSize: 16, fontWeight: '700', color: 'red'}}>
                        Delete Audio
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>

        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#fff',
  },
  
  text: {
    marginTop: 10,
    fontWeight: 'bold',
    color: '#000',
  },
  audiotext: {
    marginTop: 10,
    // fontWeight: 'bold',
    color: 'grey',
  },
  iconsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    justifyContent: 'space-evenly',
    marginTop: 10, // Add some margin at the top
  },
  iconWrapper: {
    marginHorizontal: 20, // Add margin between icons
  },

});

export default AudioRecorder;
