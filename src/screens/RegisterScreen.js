import React, { useState } from 'react'
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { Snackbar, Text } from 'react-native-paper'
import Button from '../components/Button'
import TextInput from '../components/TextInput'
import { theme } from '../core/theme'
import axios from 'axios'
import { BASE_URL } from '../constants/endpoints'
import { pinCodeValidator } from '../helpers/pinCodeValidator'
import { windowWidth, windowHeight } from '../constants/dimensions'
import { AntDesign } from "@expo/vector-icons"
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Alert } from 'react-native'

export default function RegisterScreen({ navigation, route }) {
  const { mobileNumber } = route.params
  const [name, setName] = useState({ value: '', error: '' })
  const [district, setDistrict] = useState({ value: '', error: '' })
  const [address, setAddress] = useState({value: '', error: ''})
  const [deliPinCodes, setDeliPinCodes] = useState([{value: "", error: ""}])
  const [password, setPassword] = useState({value: "", error: ""})
  const [password1, setPassword1] = useState({value: "", error: ""})
  const [status, setStatus] = useState("not added")


  const addNewInput = () => {
    setDeliPinCodes((prev) => [...prev, { value: '', error: '' }]);
  };

  const onSignUpPressed = () => {
    setStatus("adding")
    const newSeller = {
      Name: name.value,
      District: district.value,
      Address: address.value,
      DeliverablePinCodes: deliPinCodes,
      MobileNumber: mobileNumber,
      Password: password.value
    }
    let emptyWarn = "This field cannot be empty"
    console.log(newSeller)
    let isError = false
    Object.entries(newSeller).map((e, i) => {
        ({
          Name() {
            let msg;
            if (!e[1] || e[1] === "")
              msg = emptyWarn
            isError = isError || !!msg;
            setName({...name, error: msg})
          },
          District() {
            let msg;
            if (!e[1] || e[1] === "")
              msg = emptyWarn
              isError = isError || !!msg;
            setDistrict({...district, error: msg})
          },
          Address() {
            let msg;
            if (!e[1] || e[1] === "")
              msg = emptyWarn
              isError = isError || !!msg;
            setAddress({...address, error: msg})
          },
          DeliverablePinCodes() {
            // console.log(e[1])
            e[1].map((o, j) => {
              let msg;
              if ((!o.value || o.value === "") && j === 0) {
                msg = emptyWarn
              } else if ((!pinCodeValidator(o.value) && j===0) || (o.value!==""&&!pinCodeValidator(o.value)&&j>0))
                msg = "Please enter a valid PIN code"
                isError = isError || !!msg;
              setDeliPinCodes((prev) => {
                const updated = [...prev]
                updated[j].error = msg;
                return updated;
              })
            })
          },
          MobileNumber() {},
          Password() {
            let msg;
            if (e[1] !== password1.value) {
              msg = "Passwords do not match";
            } else if (!e[1] || e[1]?.length < 8) {
              msg = "Password should be atleast 8 characters";
            }
            isError = isError || !!msg;
            setPassword({...password, error: msg});
            setPassword1({...password1, error: msg});
          }
        })[e[0]]()
    })
    if (isError) {
      setStatus("not added")
      return;
    }
    
    axios.post(`${BASE_URL}/api/seller/register`, {
      ...newSeller,
      DeliverablePinCodes: newSeller.DeliverablePinCodes.filter(o => !!o.value).map(o => o.value)
    })
    .then((res) => {
      setStatus("added")
      console.log(res.data)
      Alert.alert("Registration completed", "Your details have been saved", [
        {
          text: "OK",
          onPress: async () => {
            await AsyncStorage.setItem('seller', JSON.stringify(res.data.newSeller))
            navigation.reset({
              index: 0,
              routes: [{ name: 'Dashboard' }],
            })
          }
        }
      ], {
        onDismiss: async () => {
          await AsyncStorage.setItem('seller', JSON.stringify(res.data.newSeller))
          navigation.reset({
            index: 0,
            routes: [{ name: 'Dashboard' }],
          })
        }
      })
      
    }).catch((err) => {
      setStatus("not added")
      delete err.stack
      console.log(JSON.stringify(err))
    })

  }

  return (
    
    <View style={styles.page}>
    <View style={styles.navbar}>
      <View style={styles.headerContainer}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
              <AntDesign name="left" size={25} color="white" />
            </TouchableOpacity>
            <View style={{
                alignItems: "center",
                width: "90%",
            }}>
                <Text style={{
                    fontWeight: "bold",
                    fontSize: 24,
                    color: "#fff",
                    paddingRight: 15
                  }}>{"Enter Details"}</Text>
              </View>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.inputContainer}>
      <Text style={{
        fontWeight: "700",
        width: "100%",
        textAlign: "left",
        color: "#333",
        marginTop: "10px"
      }}>Unit Details:</Text>
      <TextInput
        label="Unit Name"
        returnKeyType="next"
        value={name.value}
        onChangeText={(text) => setName({ value: text, error: '' })}
        error={!!name.error}
        errorText={name.error}
      />
      <TextInput
        label="District"
        returnKeyType="next"
        value={district.value}
        onChangeText={(text) => setDistrict({ value: text, error: '' })}
        error={!!district.error}
        errorText={district.error}
      />
      <TextInput
        label="Address"
        returnKeyType="next"
        value={address.value}
        onChangeText={(text) => setAddress({ value: text, error: '' })}
        error={!!address.error}
        errorText={address.error}
      />
      <TextInput
        label="Mobile Number"
        returnKeyType="next"
        value={mobileNumber}
        disabled={true}
      />
      <Text style={{
        fontWeight: "700",
        width: "100%",
        textAlign: "left",
        color: "#333",
        marginTop: "10px"
      }}>Deliverable PIN Codes:</Text>
      {deliPinCodes.map((pinCode, i) => (
        <TextInput
          key={i}
          label={`PIN Code ${i + 1}`}
          returnKeyType="next"
          value={pinCode.value}
          onChangeText={(text) => {
            setDeliPinCodes((prev) => {
              const updatedPinCodes = [...prev];
              updatedPinCodes[i].value = text;
              return updatedPinCodes;
            });
          }}
          error={!!pinCode.error}
          errorText={pinCode.error}
          keyboardType="numeric"
        />
      ))}
      <Button title="Add" onPress={addNewInput}>+ Add</Button>
      <Text style={{
        fontWeight: "700",
        width: "100%",
        textAlign: "left",
        color: "#333",
        marginTop: "10px"
      }}>Create Password:</Text>
      <TextInput
        label="Password (min 8 characters)"
        returnKeyType="next"
        value={password.value}
        onChangeText={(text) => setPassword({ value: text, error: '' })}
        error={!!password.error}
        errorText={password.error}
        secureTextEntry
      />
      <TextInput
        label="Re-enter Password"
        returnKeyType="next"
        value={password1.value}
        onChangeText={(text) => setPassword1({ value: text, error: '' })}
        error={!!password1.error}
        errorText={password1.error}
        secureTextEntry
      />
      <Button
      disabled={status !== "not added"}
        mode="contained"
        onPress={onSignUpPressed}
        style={{ marginTop: 24, marginBottom: 50, width: "70%" }}
      >
        {status === "added"?"Registered":"Register"}
      </Button>
    
    </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  link: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  page: {
    flex: 1,
    backgroundColor: "#fff"
  },
  navbar: {
    position: "sticky",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    height: windowHeight*0.08, // You can adjust the height as needed
    padding: 0,
    margin: 0,
    width: "100%",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: windowHeight*0.02,
    justifyContent: "space-around",
    paddingHorizontal: 15
  },
  inputContainer: {
    alignItems: "center",
    paddingHorizontal: 40,
    marginTop: 20
  },
})
