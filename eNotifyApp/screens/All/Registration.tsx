import {
  View,
  Text,
  Alert,
  StyleSheet,
  useColorScheme,
  Animated,
  Dimensions,
  useAnimatedValue,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import {TextInput, TouchableOpacity} from 'react-native-gesture-handler';
import {
  RegistrationProps,
  User,
  Navigation,
} from '../../components/Types/indexTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import {PermissionsAndroid} from 'react-native';
import Colors from '../../components/Constants/Color';
import LinearGradient from 'react-native-linear-gradient';
import {StackNavigationProp} from '@react-navigation/stack';
import {Circle, Svg} from 'react-native-svg';
import Loading from './Loading';

PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
PermissionsAndroid.request(
  PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
);
PermissionsAndroid.request(
  PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
);

const RegistrationScreen = ({
  navigation,
}: {
  navigation: StackNavigationProp<Navigation, 'Registration', undefined>;
}) => {
  const isDarkMode = useColorScheme() === 'dark';

  const [isCorrect, setIsCorrect] = useState(true);
  const [value, setValue] = useState('');
  const subscriptions = ['Prvi', 'Drugi', 'Treci', 'Cetvrti'];

  const saveUser = async (user: User) => {
    AsyncStorage.setItem('Role', user.Role);
    AsyncStorage.setItem('Class', user.Class);
    AsyncStorage.setItem('Name', user.Name);
    AsyncStorage.setItem('UserId', value);
    messaging().subscribeToTopic('Svi');
    if (user.Role !== 'Professor') {
      messaging().subscribeToTopic(
        subscriptions[parseInt(user.Class.slice(0, 1)[0]) - 1],
      );
      messaging().subscribeToTopic(user.Class);
      console.log(user.Class);
    }

    firestore()
      .collection('Users')
      .where('UserID', '==', user.UserID)
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          // Update the document
          firestore().collection('Users').doc(doc.id).update({
            LogOut: false,
          });
        });
      });
  };
  
  const Login = () => {
    const query = firestore().collection('Users').where('UserID', '==', value);
    query
      .get()
      .then(querySnapshot => {
        if (!querySnapshot.empty) {
          const saveAll = async () => {
            setIsCorrect(true);
            const user: User = querySnapshot.docs[0].data() as User;
            await saveUser(user);
            
            navigation.navigate('NavigationScreen');
          };
          saveAll();
        } else {
          setIsCorrect(false);
        }
      })
      .catch(error => {
        console.error('Error getting document:', error);
      });
  };
  return (
    <>
      <View style={styles.container}>
        <View>
          <Text style={styles.incorrectText}>
            {isCorrect ? '' : 'Niste uneli dobar kod'}
          </Text>
          <TextInput
            placeholder="Unesite vas identifikacioni kod"
            placeholderTextColor={
              isDarkMode ? Colors.Dark.lightText : Colors.Light.lightText
            }
            autoCapitalize="none"
            onChangeText={text => {
              setValue(text);
              setIsCorrect(true);
            }}
            value={value}
            style={[
              isDarkMode ? styles.inputDark : styles.input,

              {
                borderColor: isCorrect
                  ? isDarkMode
                    ? Colors.Dark.lightText
                    : Colors.Light.lightText
                  : 'red',
              },
            ]}
          />
        </View>
        <TouchableOpacity onPress={() => Login()} activeOpacity={0.8}>
          <LinearGradient
            start={{x: 1.3, y: 0}}
            end={{x: 0, y: 0}}
            colors={
              isDarkMode
                ? [Colors.Dark.accent, Colors.Dark.accent]
                : ['#C6E2F5', '#2077F9']
            }
            style={isDarkMode ? styles.confirmBtnDark : styles.confirmBtn}>
            <Text
              style={isDarkMode ? styles.confirmTxtDark : styles.confirmTxt}>
              Registruj se
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View
        style={[
          isDarkMode
            ? {backgroundColor: Colors.Dark.appBackground}
            : {backgroundColor: Colors.Light.appBackground},
          {width: '100%', height: '100%', zIndex: 0},
        ]}></View>
    </>
  );
};
const checkStat = async () => {
  const userId = await AsyncStorage.getItem('UserId');
  await firestore()
    .collection('Users')
    .where('UserID', '==', userId)
    .get()
    .then(snapshot => {
      if (!snapshot.empty) {
        const user: User = snapshot.docs[0].data() as User;
        if (user.LogOut === true) {
          const deleteUser = async () => {
            await AsyncStorage.removeItem('Role');
            await AsyncStorage.removeItem('Class');
            await AsyncStorage.removeItem('Name');
            await AsyncStorage.removeItem('UserId');
          };
          deleteUser();
        }
      }
    });
};
const LoadingScreen = (
  navigation: StackNavigationProp<Navigation, 'Registration', undefined>,
) => {
  const [naziv, setNaziv] = useState('wait');
  const uzmiNaziv = async () => {
    const value = await AsyncStorage.getItem('Name');
    if (value !== null) setNaziv('yes');
    else setNaziv('no');
  };
  const getRazred = async () => {
    const razred = await AsyncStorage.getItem('Class');

    if (razred !== null) {
      navigation.navigate('NavigationScreen');
      return false;
    } else {
      return true;
    }
  };
  const check = async () => {
    await checkStat();
    await uzmiNaziv();
  };
  check();
  if (naziv === 'yes') getRazred();
  else if (naziv === 'no') return true;
  else return false;
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const Registration = ({navigation}: RegistrationProps) => {
  const isDarkMode = useColorScheme() === 'dark';
  const animationValue = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animationValue, {
          toValue: 1200,
          duration: 6000,
          useNativeDriver: true,
        }),
        Animated.timing(animationValue, {
          toValue: 0,
          duration: 6000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  });
  // AsyncStorage.removeItem('Role');
  // AsyncStorage.removeItem('Class');
  // AsyncStorage.removeItem('Name');
  // AsyncStorage.removeItem('UserId');
  if (LoadingScreen(navigation) === true) {
    return <RegistrationScreen navigation={navigation} />;
  } else {
    return <Loading />;
  }
};

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
const loadWidth = 600;
const R = loadWidth / (2 * Math.PI);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 100,
    flex: 1,
    gap: 20,
    alignContent: 'center',
    justifyContent: 'center',
  },
  incorrectText: {
    color: 'red',

    width: '80%',

    alignSelf: 'center',
    textAlign: 'left',
    fontFamily: 'Mulish',
  },
  input: {
    fontSize: 17,
    fontFamily: 'Mulish',

    backgroundColor: Colors.Light.textInputBackground,
    color: Colors.Light.textPrimary,

    padding: 15,
    width: '80%',

    alignSelf: 'center',

    borderRadius: 10,

    borderWidth: 1,
    borderColor: Colors.Light.lightText,

    elevation: 13,
    shadowColor: Colors.Light.black,
    shadowOffset: {width: 2, height: 5},
    shadowRadius: 1,
  },
  inputDark: {
    fontSize: 17,
    fontFamily: 'Mulish',

    backgroundColor: Colors.Dark.textInputBackground,
    color: Colors.Dark.textPrimary,

    padding: 15,
    width: '80%',

    alignSelf: 'center',

    borderRadius: 10,

    borderWidth: 1,
    borderColor: Colors.Dark.lightText,

    elevation: 13,
    shadowColor: Colors.Dark.black,
    shadowOffset: {width: 2, height: 5},
    shadowRadius: 1,
  },
  confirmBtn: {
    backgroundColor: Colors.Light.accent,

    padding: 20,

    width: '50%',

    alignSelf: 'center',
    alignItems: 'center',

    borderRadius: 50,
  },
  confirmBtnDark: {
    backgroundColor: Colors.Dark.accent,

    padding: 20,

    width: '50%',

    alignSelf: 'center',
    alignItems: 'center',

    borderRadius: 50,
  },
  confirmTxt: {
    fontSize: 17,

    color: Colors.Light.whiteText,
    fontFamily: 'Mulish',
  },
  confirmTxtDark: {
    fontSize: 17,

    color: Colors.Dark.whiteText,
    fontFamily: 'Mulish',
  },
  loadingText: {
    fontSize: 36,
    position: 'absolute',
    top: screenHeight / 2 - R - 30,
    alignSelf: 'center',
    zIndex: 100,
  },
});

export default Registration;
