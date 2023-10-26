import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Snackbar } from 'react-native-paper';
import { BASE_URL } from '../constants/endpoints';
import axios from "axios"
import { phoneValidator } from '../helpers/phoneValidator';
import { Alert } from 'react-native';
import { Platform } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native';
import AsyncStorage  from "@react-native-async-storage/async-storage"


const StartScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState({
    value: "1234567890",
    error: ""
  });
  const [password, setPassword] = useState({
    value: "homeshop",
    error: ""
  });
  const [error, setError] = useState("");
  const [isSnackbarVisible, setSnackbarVisible] = useState(false);
  const [verified, setVerified] = useState(false)

  // useEffect(() => {
  //   AsyncStorage.getItem("sellerId")
  //   .then((value) =>{
  //     if (!!value) {
  //       navigation.reset({
  //         index: 0,
  //         routes: [{ name: "Dashboard" }]
  //       })
  //     }
  //   }).catch(console.log)
  // }, [])


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
    axios.post(`${BASE_URL}/api/seller/verify-phone`, {
      mobileNumber: phoneNumber.value
    }).then((res) => {
      setError(JSON.stringify(res.body))
      setVerified(true)
      console.log(res)
    })
    .catch((err) => {
      console.log(JSON.stringify(err))
      if (Platform.OS === "android") {
        Alert.alert(
          'Phone number not registered yet',
          'Do you want to register as a new Seller?', // <- this part is optional, you can pass an empty string
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
      AsyncStorage.setItem("sellerId", res.data.seller.SellerId)
      .then(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Dashboard' }],
        })
      })
    }).catch((err) => {
      console.log(err)
      setPassword({...password, error: "Incorrect Password"})
    })
  }

  return (
    <View style={styles.container}>
      {verified && <TouchableWithoutFeedback onPress={() => {
      setVerified(false);
      setPhoneNumber({ value: "", error: "" });
    }}>
      
      <Text style={{ color: 'blue', textDecorationLine: 'underline', marginBottom: "10px" }}>
        Change Number
      </Text>
    </TouchableWithoutFeedback>}
      <View style={styles.inputContainer}>
        <TextInput
          label="Phone Number"
          value={phoneNumber.value}
          onChangeText={(text) => setPhoneNumber({...phoneNumber, value: text})}
          error={!!phoneNumber.error}
          errorText={phoneNumber.error}
          keyboardType='numeric'
          disabled={verified}
        />
      </View>
      {verified && <TextInput
        label="Password"
        returnKeyType="done"
        value={password.value}
        onChangeText={(text) => setPassword({ value: text, error: '' })}
        error={!!password.error}
        errorText={password.error}
        secureTextEntry
        
        
      />}

      <Button style={{
        marginTop: "20px"

      }} mode="contained" onPress={verified?handleSignin:handleProceed}>
        {verified?"Sign In":"Proceed"}
      </Button>
      <Snackbar
        visible={isSnackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        action={{
          label: 'Dismiss',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {error}
      </Snackbar>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
    padding: 16,
    justifyContent: 'center',
  },
  inputContainer: {
    marginBottom: 16
  }
});

export default StartScreen;
