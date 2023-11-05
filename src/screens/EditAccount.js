import React, { useEffect, useState } from 'react'
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
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

export default function EditAccount({ navigation }) {
  const [name, setName] = useState({ value: "", error: '' })
  const [district, setDistrict] = useState({ value: "", error: '' })
  const [address, setAddress] = useState({value: "", error: ''})
  const [deliPinCodes, setDeliPinCodes] = useState([])
  const [loading, setLoading] = useState(false)
  const [sellerId, setSellerId] = useState("")
  const [status, setStatus] = useState("not added")

  useEffect(() => {
    setLoading(true)
    AsyncStorage.getItem('seller')
    .then(JSON.parse)
    .then((seller) => {
        setSellerId(seller.SellerId)
        setName({value: seller.Name, error: ""})
        setAddress({value: seller.Address, error: ""})
        setDistrict({value: seller.District, error: ""})
        setDeliPinCodes(seller.DeliverablePinCodes.map(p => ({
            value: p,
            error: ""
        })))
        setLoading(false)
    })
    .catch(console.log)
  }, [])

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

        })[e[0]]()
    })
    if (isError) {
        setStatus("not added")
        return;
    }

    axios.post(`${BASE_URL}/api/seller/account/edit`, {
        SellerId: sellerId, 
      ...newSeller,
      DeliverablePinCodes: newSeller.DeliverablePinCodes.filter(o => !!o.value).map(o => o.value)
    })
    .then((res) => {
      console.log(res.data)
      setStatus("added")
      Alert.alert("Details updated", "Your details have been updated", [
        {
          text: "OK",
          onPress: async () => {
            await AsyncStorage.setItem('seller', JSON.stringify(res.data.seller))
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
                width: "90%"
            }}>
                <Text style={{
                    fontWeight: "bold",
                    fontSize: 24,
                    color: "#fff",
                    paddingRight: 20
                  }}>{"Edit Account Details"}</Text>
              </View>
        </View>
      </View>
      {loading && <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>}
      {!loading && <ScrollView contentContainerStyle={styles.inputContainer}>
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
      <Button
        disabled={status !== "not added"}
        mode="contained"
        onPress={onSignUpPressed}
        style={{ marginTop: 24, marginBottom: 50, width: "70%" }}
      >
        {status === "added"?"Updated":"Update Details"}
      </Button>
    
    </ScrollView>}
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
  loading: {
    marginTop: 70
  }
})
