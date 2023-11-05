import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button, Snackbar } from 'react-native-paper';
import { BASE_URL } from '../constants/endpoints';
import axios from "axios"
import { phoneValidator } from '../helpers/phoneValidator';
import { Alert } from 'react-native';
import { Platform } from 'react-native';
import { TouchableWithoutFeedback, Image } from 'react-native';
import AsyncStorage  from "@react-native-async-storage/async-storage"
import TextInput from '../components/TextInput';
import { Entypo } from '@expo/vector-icons'
import { theme } from '../core/theme';
import { windowHeight, windowWidth } from '../constants/dimensions'
import { ActivityIndicator } from 'react-native';


const StartScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState({
    value: "",
    error: ""
  });
  const [password, setPassword] = useState({
    value: "",
    error: ""
  });
  const [isSnackbarVisible, setSnackbarVisible] = useState(false);
  const [verified, setVerified] = useState(false)
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    setLoading(true)
    AsyncStorage.getItem("seller")
    .then(JSON.parse)
    .then((seller) =>{
      if (!!seller.SellerId) {
        navigation.reset({
          index: 0,
          routes: [{ name: "Dashboard", }]
        })
      }
      setTimeout(() => {
        setLoading(false)
      }, 500)
    }).catch((err) => {
      setLoading(false)
      console.log(err)
    })
  }, [])


  const handleProceed = async () => {
    // console.log(BASE_URL)
    // REMOVE
    // navigation.navigate("Dashboard")
    if (!phoneValidator(phoneNumber.value)) {
      setPhoneNumber({
        ...phoneNumber,
        error: "Please enter a valid mobile number"
      })
      return;
    } else {
      setPhoneNumber({...phoneNumber, error: ""})
    }
    setVerifying(true)
    axios.post(`${BASE_URL}/api/seller/verify-phone`, {
      mobileNumber: phoneNumber.value
    }).then((res) => {
      setVerified(true)
      setVerifying(false)
      console.log(res)
    })
    .catch((err) => {
      console.log(err)
      console.log(JSON.stringify(err))
      setVerifying(false)
      if (Platform.OS === "android") {
        Alert.alert(
          'Phone number not registered yet',
          'Do you want to register as a new seller?', // <- this part is optional, you can pass an empty string
          [
            {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
            {text: 'YES', onPress: () => navigation.navigate("RegisterScreen", {
              mobileNumber: phoneNumber.value
            })},
          ],
          {cancelable: true},
          
        );
      } else {
        navigation.navigate("RegisterScreen", {
          mobileNumber: phoneNumber.value
        })
      }
    })
    // Add your logic here to send OTP or validate the phone number
    // You can handle errors and display them using setError and setSnackbarVisible
  };

  const handleSignin = () => {
    axios.post(`${BASE_URL}/api/seller/login`, {
      mobileNumber: phoneNumber.value,
      password: password.value
    })
    .then((res) => { 
      console.log(res.data)
      AsyncStorage.setItem('seller', JSON.stringify(res.data.seller))
      .then(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Dashboard'}],
        })
      })
    }).catch((err) => {
      console.log(err)
      setPassword({...password, error: "Incorrect Password"})
    })
  }

  return (
    
    !!!loading? (<View style={styles.container}>
      
      <View style={styles.inputContainer}>
      <View style={styles.imageContainer}>
        <Image source={require("../../assets/seller_login.png")} style={styles.image}/>
      </View>
      {verified && <TouchableWithoutFeedback onPress={() => {
      setVerified(false);
      setPhoneNumber({ value: "", error: "" });
    }}>
      <Text style={{ color: '#66f', marginBottom: "10px" }}>
        Change Number
        <Entypo style={{paddingTop: 3, marginLeft: 3}} name="edit" size={12}/>
      </Text>
    </TouchableWithoutFeedback>}
        <TextInput
          label="Mobile Number"
          value={phoneNumber.value}
          onChangeText={(text) => setPhoneNumber({...phoneNumber, value: text})}
          error={!!phoneNumber.error}
          errorText={phoneNumber.error}
          keyboardType='numeric'
          disabled={verified}
        />
      {verified && <TextInput
        autoFocus
        label="Password"
        returnKeyType="done"
        value={password.value}
        onChangeText={(text) => setPassword({ value: text, error: '' })}
        error={!!password.error}
        errorText={password.error}
        secureTextEntry
        
        
      />}
      {verifying? <ActivityIndicator style={{marginTop: 15}} size="large" color={theme.colors.primary} /> :<Button style={{
        marginTop: 15

      }} mode="contained" onPress={verified?handleSignin:handleProceed}>
        {verified?"Sign In":"Proceed"}
      </Button>}
      </View>
      
      
    </View>
  ): (
  <View style={styles.loadingScreen}>

  </View>));
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  inputContainer: {
    marginTop: windowHeight*0.1,
    marginBottom: 16,
    paddingHorizontal: 50
  },
  loadingScreen: {
    backgroundColor: theme.colors.primary,
    width: "100%",
    height: "100%"
  },
  image: {
    width: 150,
    height: 150,
    // objectFit: "contain",
    marginBottom: 40
  },
  imageContainer: {
    alignItems: "center"
  }
});

export default StartScreen;
