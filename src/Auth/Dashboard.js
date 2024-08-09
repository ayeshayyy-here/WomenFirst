/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import { useEffect, useState } from 'react';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ImageBackground,
  ScrollView,
} from 'react-native';


import { Image } from "react-native";


const Dashboard = ({ route, navigation }) => {


  const [loading, setLoading] = useState(false);
  const [fullname, setFullName] = useState('');



//   useEffect(() => {
//     const user = syncStorage.get('user_detail');
//     if (user?.name) {
//         console.log('User', user);
//         setFullName(user.name);
//     }
// }, []);
// const handleLogout = async () => {
//   try {
//     await EncryptedStorage.clear();
//     console.log('User data cleared from encrypted storage');
//     navigation.navigate('Main');
//   } catch (error) {
//     console.error('Error clearing user data:', error);
//   }
// };

//   const handle = async (navigation) => {
//     try {
//       // Clear user details from sync storage
//       syncStorage.remove('user_detail');
      
//       // Reset navigation stack to navigate back to Login screen
//       navigation.reset({
//         index: 0,
//         routes: [{ name: 'Login' }],
//       });
//     } catch (e) {
//       console.error('Error during logout:', e);
//       // Handle logout error if needed
//     }
//   };

  return (

    <View>

      <ImageBackground style={{ width: '100%', height: '100%', opacity:0.9 }}>


        <View style={{ flexDirection: 'row', marginBottom: 30, }}>
          <TouchableOpacity>
            {/* <Icon
            style={styles.searchIcon}
            name={'bars'}
            size={40}
            color="#fff"
          />  */}
          </TouchableOpacity>
          <Text style={{ fontFamily: 'sans-serif',fontWeight:600, fontSize: 30, color: 'black',paddingHorizontal:20, paddingTop: 10, padding: 10, }}>Dashboard
          </Text>
          <View style={{ justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 30, marginLeft: 'auto' }}>
           
            <TouchableOpacity
              onPress={() => handleLogout(navigation)}
              style={styles.ButtonStyle}
              activeOpacity={0.5}>
              <Text style={[styles.text, { textAlign: 'center' }]}>Logout</Text>
            </TouchableOpacity>

          </View>
        </View>

       {/* {imageProfile != '' ?
          <View style={[styles.info]} >

           
            <Image source={{ uri: `https://dpmis.punjab.gov.pk/uploads/profileimg/${imageProfile}` }} style={{ width: 50, height: 50, borderRadius: 25, marginLeft: 40 }} />
            <Text style={[styles.fullNametext]}>
              {fullname}

            </Text>

          </View> : */}
          <View style={[styles.info]}>
        
            <Text style={[styles.fullNametext]}>
              {fullname}
            </Text>
          </View>
          {/* }  */}
        <View style={{ padding: 1, flex: 1, justifyContent: 'center', paddingTop: 100 }}>
          <View style={{ width: '100%', backgroundColor: '#fff', height: '100%', padding: 20, borderTopLeftRadius: 40, borderTopRightRadius: 40, opacity: 0.9 }}>
            <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
              <View style={[styles.row]}>
                <TouchableOpacity style={[styles.card]}>
                  <View style={styles.cardImage}>
                    <Image style={styles.bannerImage} />
                  </View>
                  <View style={styles.cardTextView}>
                    <Text style={styles.cardText}>Complaint</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.card]}>
                  <View style={styles.cardImage}>
                    <Image style={styles.bannerImage} />
                  </View>
                  <View style={styles.cardTextView}>
                    <Text style={styles.cardText}>Complaint</Text>
                  </View>
                </TouchableOpacity>
              
                {/* modal drtc */}
                {/* <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}> */}
              {/*   <Modal
                  animationType="fade"
                  transparent
                  visible={modalVisible}
                  onRequestClose={() => setModalVisible(false)}
                >
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 }}>
                    <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 20 }}>
                      <Text style={{ color: 'black', textAlign: "center", fontSize: 15, marginTop: 10 }}>
                        یہ سروس حاصل کرنے کے لیے پہلے اپنا معزوری سرٹیفیکیٹ دی گئی (TAB (PWD Registration پر کلک کر کے حاصل کریں۔
                      </Text>
                      <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity
                          onPress={handleSpeechDrtc}
                          style={styles.SpeakButton}
                          activeOpacity={0.5}>
                          <Text style={[styles.text, { textAlign: 'center', color: '#fff' }]}>Speak 🔊</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={handleStopSpeechDrtc}
                          style={styles.SpeakButton}
                          activeOpacity={0.5}>
                          <Text style={[styles.text, { textAlign: 'center', color: '#fff' }]}>Stop  🔇</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={{ flexDirection: "row" }}>
                        <TouchableOpacity
                          style={styles.SpeakButton}
                          activeOpacity={0.5}
                          onPress={() => setModalVisible(false)}
                        >
                          <Text style={[styles.text, { textAlign: 'center', color: '#fff', fontSize: 16, fontFamily: 'sans-serif' }]}>Skip</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Modal> */}
                {/* </View> */}
                {/* end drtc */}
              </View>
              <View style={[styles.row]}>
                <TouchableOpacity style={[styles.card]}>
                  <View style={styles.cardImage}>
                    <Image style={styles.bannerImage} />
                  </View>
                  <View style={styles.cardTextView}>
                    <Text style={styles.cardText}>Complaint</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.card]}>
                  <View style={styles.cardImage}>
                    <Image style={styles.bannerImage} />
                  </View>
                  <View style={styles.cardTextView}>
                    <Text style={styles.cardText}>Complaint</Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View style={[styles.row]}>
                <TouchableOpacity style={[styles.card]}>
                  <View style={styles.cardImage}>
                    <Image style={styles.bannerImage} />
                  </View>
                  <View style={styles.cardTextView}>
                    <Text style={styles.cardText}>Complaint</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity>
                
                </TouchableOpacity>
              </View>
              {/* <View style={styles.row}>
                <TouchableOpacity style={styles.card}
                  onPress={() => Alert.alert('Coming Soon!')}
                // onPress={() => setModalVisible(true)}
                >
                  <View style={styles.cardImage}>
                    <Image source={BaitulMall} style={styles.bannerImage} />
                  </View>
                  <View style={styles.cardTextView}>
                    <Text style={styles.cardText}>Bait-ul-Maal</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.card} onPress={() => Alert.alert('Coming Soon!')}>
                  <View style={styles.cardImage}>
                    <Image source={Zakat} style={styles.zakatimage} />
                  </View>
                  <View style={styles.cardTextView}>
                    <Text style={styles.cardText}>Zakat</Text>
                  </View>
                </TouchableOpacity>
              </View> */}
             {/*  <View style={[styles.row,]}>
                <TouchableOpacity style={styles.card}
                  onPress={() => setModalVisibleFitNo(true)}
                >
                  <View style={styles.cardImage}>
                    <Image source={NashemanImage} style={styles.nashemanimage} />
                  </View>
                  <View style={styles.cardTextView}>
                    <Text style={styles.cardText}>Nasheman</Text>
                  </View>
                </TouchableOpacity>
                <Modal
                  animationType="fade"
                  transparent
                  visible={modalVisibleFitNo}
                  onRequestClose={() => setModalVisibleFitNo(false)}
                >
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 }}>
                    <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 20 }}>
                      <Text style={{ color: 'black', textAlign: "center", fontSize: 15, marginTop: 10 }}>
                      آپ اس سروس سے فائدہ اٹھانے کے اہل نہیں ہیں۔
                      </Text>
                      <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity
                          onPress={handleSpeechNasheman}
                          style={styles.SpeakButton}
                          activeOpacity={0.5}>
                          <Text style={[styles.text, { textAlign: 'center', color: '#fff' }]}>Speak 🔊</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={handleStopSpeechNasheman}

                          style={styles.SpeakButton}
                          activeOpacity={0.5}>
                          <Text style={[styles.text, { textAlign: 'center', color: '#fff' }]}>Stop  🔇</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={{ flexDirection: "row" }}>
                        <TouchableOpacity
                          style={styles.SpeakButton}
                          activeOpacity={0.5}
                          onPress={() => setModalVisibleFitNo(false)}
                        >
                          <Text style={[styles.text, { textAlign: 'center', color: '#fff', fontSize: 16, fontFamily: 'sans-serif' }]}>Skip</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Modal>
                <TouchableOpacity style={[styles.card]}   onPress={() => Alert.alert('Coming Soon!')}>
                  <View style={styles.cardImage}>
                    <Image source={Enabled} style={styles.enabledimage} />
                  </View>
                  <View style={styles.cardTextView}>
                    <Text style={styles.cardText}># Enabled</Text>
                  </View>
                </TouchableOpacity>
              </View> */}
            {/*   <View style={styles.row}>
                <TouchableOpacity style={styles.card}
                  onPress={() => Alert.alert('Coming Soon!')}>
                  <View style={styles.cardImage}>
                    <Image source={PMAImage} style={styles.enabledimage} />
                  </View>
                  <View style={styles.cardTextView}>
                    <Text style={styles.cardText}>PMA</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.card}
                  onPress={() =>
                    navigation.navigate('Complaint')}>
                  <View style={styles.cardImage}>
                    <Image source={ComplaintIMG} style={styles.enabledimage} />
                  </View>
                  <View style={styles.cardTextView}>
                    <Text style={styles.cardText}>Complaint</Text>
                  </View>
                </TouchableOpacity>
               
              </View> */}
            </ScrollView>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};


const styles = StyleSheet.create({
  SpeakButton: {
    justifyContent: 'center',
    width: '35%',
    padding: 10,
    marginTop: 15,
    // marginLeft: '15%',
    flex: 1,
    marginRight: 5,
    borderRadius: 10,
    backgroundColor: '#002D62',
    color: '#fff'
  },
  closeIcon: {
    marginLeft: '90%'
  },
  searchIcon: {
    fontSize: 30,
    padding: 10,
    margin: 2
  },
  bannerImage: {
    width: '85%',
    height: '85%',
    resizeMode: 'contain',
    // color:'black'
  },
  BannerImage: {
    width: '85%',
    height: '85%',
    resizeMode: 'contain',
    marginTop: 10,
  },
  enabledimage: {
    width: '85%',
    height: '85%',
    resizeMode: 'contain',
    marginTop: 10,
  },
  zakatimage: {
    width: '85%',
    height: '85%',
    resizeMode: 'contain',
    marginTop: 10,
  },
  nashemanimage: {
    width: '85%',
    height: '85%',
    resizeMode: 'contain',
    marginTop: 10,
  },
  card: {
    flexDirection: 'column',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderRadius: 30,
    flex: 1,
    width: '100%',
    height: 120,
    marginStart: 7,
    marginEnd: 7,
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    height: 135,


  },
  invisible: {
    flexDirection: 'column',
    flex: 1,
    width: '100%',
    height: 120,
    marginStart: 7,
    marginEnd: 7,
  },
  cardImage: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    alignSelf: 'center',
    height: '100%',
    flex: 2,
    alignItems: 'center',
  },
  cardTextView: {
    flex: 1,
    top: 20,
    alignItems: 'center',

  },
  ButtonStyle: {
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 10,
    backgroundColor: '#da1703',
    marginLeft: '3%',
    marginTop: 10,
    fontFamily: 'sans-serif',
  },
  updatebutton: {
    justifyContent: 'center',
    paddingVertical: 13,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: '#002D62',
    marginTop: 10,
    fontFamily: 'sans-serif'

  },
  cardText: {
    fontSize: 14.50,
    fontFamily: 'sans-serif',
    bottom: 15,
    color: '#000',
    fontWeight: '600'

  },
  text: {
    color: 'white',
    
    fontSize: 15,
    fontFamily: "sans-serif",

  },
  button: {
    justifyContent: 'center',
    paddingVertical: 5,
    height: 50,
    width: 100,
    // paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: '#002D62',
    // marginLeft:'2%',
    marginTop: 10
  },
  skipbutton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    height: 50,
    width: 100,
    // paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: '#002D62',
    marginTop: 15,
    marginLeft: '30%'
  },
  info: {
    // backgroundColor: '#da1703',
    backgroundColor: '#da1703',
    height: 50,
    width: '80%',
    // opacity: 0.9,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    flexDirection: 'row',
    //  justifyContent:'space-between'
  },
  dropdown: {
    height: 40,
    width: '100%',
    borderColor: 'white',
    borderWidth: 0.5,
    borderRadius: 5,
    paddingHorizontal: 4,
    backgroundColor: '#D3D3D3',
    marginTop: 10
  },
  placeholderStyle: {
    textAlign: 'center',
    fontSize: 15
  },
  selectedTextStyle: {
    color: 'black',
  },
  TEXTstyle: {
    color: 'black'
  },
  fullNametext:
  {
    color: '#fff',
    // marginLeft: 20,
    // marginTop: 13,
    fontSize: 18,
    alignSelf:'center',
    paddingHorizontal:40

  }
});

export default Dashboard;
