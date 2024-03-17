import {
  StyleSheet,
  Text,
  View,
  Image,
  Platform,
  PermissionsAndroid,
} from 'react-native';
//import { LinearGradient } from 'expo-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import Colors from '../../components/Constants/Color';
import {format} from 'date-fns';
import {NotificationType} from '../../components/Types/indexTypes';
import firestore from '@react-native-firebase/firestore';
import {useEffect, useState} from 'react';
import storage from '@react-native-firebase/storage';
import {TouchableOpacity} from 'react-native-gesture-handler';
import RNFS from 'react-native-fs';

type Images = {
  imageUrl: string;
  imageName: string;
};

export default function Obavestenje({route}: any) {
  const navigation = useNavigation();
  const [notification, setNotification] = useState<NotificationType>();
  const [images, setImages] = useState<Images[]>([]);
  navigation.setOptions({title: ''});
  useEffect(() => {
    const getNotification = async () => {
      //Kod da uzmes podatke za notifikaciju
      const querySnapshot = await firestore()
        .collection('Notifications')
        .where('NotificationId', '==', route.params.id)
        .get();
      const data = querySnapshot.docs[0].data() as NotificationType;
      setNotification(data);
      navigation.setOptions({title: data.Tittle});
      //Kod da uzmes slike
      let imgs: string[] = data.Files.split(',');
      let imgUrls: Images[] = [];
      for (let i = 0; i < imgs.length; i++) {
        const url = await storage().ref(imgs[i]).getDownloadURL();
        console.log(url);
        imgUrls.push({imageName: imgs[i], imageUrl: url});
      }
      setImages(imgUrls);
    };
    if (!notification) getNotification();
  });

  const downloadImage = async (imageUrl: string, fileName: string) => {
    try {
      const downloadDest = `${RNFS.DownloadDirectoryPath}/${fileName}`;
      const options = {
        fromUrl: imageUrl,
        toFile: downloadDest,
      };

      const response = await RNFS.downloadFile(options);
      console.log(response);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  //request premission ne radi ali idalje mozes dodavati slike jer ne koristimo ovo ali trebamo popraviti :D
  // const requestStoragePermission = async () => {
  //   try {
  //     const granted = await PermissionsAndroid.request(
  //       PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
  //       {
  //         title: 'Storage Permission Required',
  //         message: 'This app needs access to your storage to download files.',
  //         buttonPositive: 'OK',
  //       },
  //     );
  //     if (granted === PermissionsAndroid.RESULTS.GRANTED) {
  //       console.log('Storage permission granted');
  //       return true;
  //     } else {
  //       console.log('Storage permission denied');
  //       return false;
  //     }
  //   } catch (error) {
  //     console.error('Error requesting storage permission:', error);
  //     return false;
  //   }
  // };

  //funkcija za prikazivanje slike -- trebas malo dorediti style i dodati na klik da se moze skinuti
  const renderImages = () => {
    return (
      <View style={styles.imageContainer}>
        {images.map((image, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.8}
            onPress={() => {
              downloadImage(image.imageUrl, image.imageName);
              //requestStoragePermission();
            }}
            >
              <View style={styles.imageButton}>
                <Image
                  key={index}
                  source={{uri: image.imageUrl}}
                  style={styles.image}
                />
                <View style={styles.txtContainer}>
                  <Text style={styles.txtImageName}>{image.imageName}</Text>
                  <Text style={styles.txtClick}>Click to Download</Text>
                </View>
              </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {notification && (
        <>
          <View style={styles.infoContainer}>
            <Text style={styles.class}>{notification?.Class}</Text>
            <Text style={styles.date}>
              {format(notification.Date.toDate(), 'dd.MM.yyyy')}
            </Text>
          </View>
          <Text style={styles.body}>{notification.Text}</Text>

          {images && renderImages()}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    marginTop: 10,
    fontSize: 18,
    color: Colors.Light.textPrimary,
    marginHorizontal: 15,
    fontFamily: 'Mulish',
  },
  infoContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    borderColor: Colors.Light.textSecondary,
    borderRadius: 0,
    borderBottomWidth: 1.5,
    marginHorizontal: 10,
  },
  date: {
    flex: 1,
    textAlign: 'right',
    color: Colors.Light.textPrimary,
    fontFamily: 'Mulish',
  },
  class: {
    flex: 1,
    color: Colors.Light.textPrimary,
    fontFamily: 'Mulish',
  },
  imageContainer:{
    position:'absolute',
    bottom:10,
    width:'100%',
    gap:10,
    padding:10

  },
  imageButton:{
    backgroundColor:Colors.Light.textInputBackground,
    borderRadius:10,
    padding:10,
    flexDirection:'row',

    elevation: 3,
    shadowColor: Colors.Light.black,
    shadowOffset: {width: 2, height: 5},
    shadowRadius: 1,
  },
  image:{
    width:70,
    height:70,
    borderRadius:10,
    borderWidth:1,
    borderColor:Colors.Light.lightText,
  },
  txtContainer:{
    marginLeft:10,
  },
  txtImageName:{
    color:Colors.Light.hyperlinkText,
    fontSize:14,
    fontFamily:'Mulish'
  },
  txtClick:{
    color:Colors.Light.lightText,
    fontSize:11,
    fontFamily:'Mulish'
  },
});
