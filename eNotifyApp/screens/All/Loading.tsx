import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert, View} from 'react-native';
import {Text} from 'react-native-elements';
import {LoadingProps} from '../../components/Types/indexTypes';

export default function Loading({navigation}: LoadingProps) {
  const [naziv, setNaziv] = useState(false);
  const doIt = async () => {
    // await AsyncStorage.setItem('role', 'Profesor');
    // await AsyncStorage.setItem('razred', '4ITS - Profesor');
    // await AsyncStorage.setItem('naziv', 'Dario Buljovčić');
    await AsyncStorage.removeItem('Name');
    await AsyncStorage.removeItem('Class');
    await AsyncStorage.removeItem('Role');
  };

  useEffect(() => {
    doIt();
    console.log('This is done');
    const uzmiNaziv = async () => {
      const value = await AsyncStorage.getItem('Name');
      if (value !== null) setNaziv(true);
    };
    const getRazred = async () => {
      const razred = await AsyncStorage.getItem('Class');

      if (razred !== null) {
        navigation.navigate('NavigationScreen');
      } else {
        navigation.navigate('Registration');
      }
    };
    uzmiNaziv();
    naziv === true ? getRazred() : navigation.navigate('Registration');
  }, [naziv]);
  return (
    <View>
      <Text>Loading</Text>
    </View>
  );
}
