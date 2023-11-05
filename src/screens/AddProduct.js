import React, { useEffect, useState } from 'react';
import { View, Image, Text, Button, Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';
import { BASE_URL } from '../constants/endpoints';
import TextInput from '../components/TextInput';
import DropDownPicker from 'react-native-dropdown-picker';
import { AntDesign } from '@expo/vector-icons';
import Btn from '../components/Button';
// import { SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { LogBox } from 'react-native';
import { StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { theme } from '../core/theme';
import { windowHeight, windowWidth } from '../constants/dimensions'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const UploadImageView = ({ navigation }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [message, setMessage] = useState('');
  const [productName, setProductName] = useState({value: "", error: ""})
  
  const [mrp, setMrp] = useState({value: "", error: ""})
  const [offerPrice, setOfferPrice] = useState({value: "", error: ""})
  const [description, setDescription] = useState("")
  const [prodUnit, setProdUnit] = useState({value: "", error: ""})
  const [openCategories, setOpenCategories] = useState(false);
  const [categoryOpts, setCategoryOpts] = useState([]);
  const [category, setCategory] = useState("")
  const [openAvailability, setOpenAvailability] = useState(false);
  const [availabilityOpts, setAvailabilityOpts] = useState([{
    label: "Available",
    value: true
  }, {
    label: "Not Available",
    value: false
  }])
  const [availability, setAvailability] = useState(true)
  const [status, setStatus] = useState("not added")
  useEffect(() => {
    LogBox.ignoreLogs(["VirtualizedLists should never be nested"])
  }, [])

  useEffect(() => {
    axios.get(`${BASE_URL}/api/constants/categories`)
    .then((res) => {
      setCategoryOpts(res.data.map((c) => ({
        label: c,
        value: c
      })))
    }).catch(console.log)
  }, [])

  function handleSubmit() {
    setStatus("adding")
    const newProduct = {
      ProductName: productName.value,
      Description: description,
      Category: category,
      ProductionUnit: prodUnit.value,
      MRP: mrp.value,      
      OfferPrice: offerPrice.value,
      Availability: availability,
    }
    let emptyWarn = "This field cannot be empty"
    console.log(newProduct)
    let isError = false
    Object.entries(newProduct).map((e, i) => {
        ({
          ProductName() {
            let msg;
            if (!e[1] || e[1] === "")
              msg = emptyWarn
            isError = isError || !!msg;
            setProductName({...productName, error: msg})
          },
          Description() {},
          Category() {
            let msg;
            if (!e[1] || e[1] === "") {
              msg = emptyWarn
              isError = isError || !!msg;
            // Alert.alert("Please choose a category")
            alert("Please choose a category")
            }
          },
          ProductionUnit() {
            let msg;
            if (!e[1] || e[1] === "")
              msg = emptyWarn
            isError = isError || !!msg;
            setProdUnit({...prodUnit, error: msg})
          },
          MRP() {
            let msg;
            if (!e[1] || e[1] === "")
              msg = emptyWarn
            else if (!/^[0-9]+$/.test(e[1]) || parseInt(e[1]) < 0) {
              msg = "Invalid MRP"
            } 
            isError = isError || !!msg;
            setMrp({...mrp, error: msg})
          },
          OfferPrice() {
            if (!e[1] || e[1] === "") return;
            let msg;
            if (!/^[0-9]+$/.test(e[1]) || parseInt(e[1]) < 0) {
              msg = "Invalid Offer Price"
            }
            isError = isError || !!msg;
            setOfferPrice({...offerPrice, error: msg})
          },
          Availability() {},
        })[e[0]]()
    })
    if (!selectedImage) {
      alert("Please add a product image")
      isError = true
    }
    if (isError) {
      setStatus("not added")
      return;
    }
    AsyncStorage.getItem("seller")
    .then(JSON.parse)
    .then((seller) => {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append("newProduct", JSON.stringify({
        ...newProduct,
        SellerId: seller.SellerId
      }))
      console.log(seller.SellerId)
      axios.post(`${BASE_URL}/api/product/add`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    .then((res) => {
      console.log(res.data)
      setStatus("added")
      Alert.alert("Success","Product added successfully", [
        {
          text: "OK",
          style: "cancel",
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Dashboard' }],
            })
          }
        }
      ], {
        cancelable: true,
        onDismiss: () => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Dashboard' }],
          })
        }
      })
    }).catch((err) => {
      setStatus("not added")
      console.log(err)
    })
    })
    

  } 

  const selectImage = () => {
    const options = {
      title: 'Select Product Image',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        // You can display the selected image
        console.log(response)
        const source = { 
          uri: response.assets[0].uri, 
          type: response.assets[0].type,
          name: response.assets[0].fileName 
        };
        setSelectedImage(source);
      }
    });
  };

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
                }}>{"Add Product"}</Text>
            </View>
      </View>
    </View>
    <KeyboardAwareScrollView contentContainerStyle={styles.inputContainer}>
      <TextInput
        label="Product Name"
        returnKeyType="next"
        value={productName.value}
        onChangeText={(text) => setProductName({ value: text, error: '' })}
        error={!!productName.error}
        errorText={productName.error}
      />
      <TextInput
        label="Description"
        returnKeyType="next"
        value={description}
        onChangeText={(text) => setDescription(text)}
      />
      <View style={styles.dropdownContainer}>
      <DropDownPicker
      dropDownContainerStyle={{ borderColor: "#999" }}
      style={styles.dropdown}
      placeholder='Select Category'
      open={openCategories}
      value={category}
      items={categoryOpts}
      textStyle={{
        // fontFamily: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif'
      }}
      setOpen={setOpenCategories}
      setValue={setCategory}
      onChangeValue={(value) => {
        setCategory(value)
      }}
      setItems={setCategoryOpts}
      
    />
    </View>
      <TextInput
        label="Production Unit"
        returnKeyType="next"
        value={prodUnit.value}
        onChangeText={(text) => setProdUnit({ value: text, error: '' })}
        error={!!prodUnit.error}
        errorText={prodUnit.error}
      />
      <TextInput
        label="MRP"
        returnKeyType="next"
        value={mrp.value}
        onChangeText={(text) => setMrp({ value: text, error: '' })}
        error={!!mrp.error}
        errorText={mrp.error}
        keyboardType="numeric"
      />
      <TextInput
        label="Offer Price"
        returnKeyType="next"
        value={offerPrice.value}
        onChangeText={(text) => setOfferPrice({value: text, error: ""})}
        error={!!offerPrice.error}
        errorText={offerPrice.error}
        keyboardType="numeric"
      />
      <View style={styles.dropdownContainer}>
      <DropDownPicker
      dropDownContainerStyle={{ borderColor: "#999" }}
      style={styles.dropdown}
      open={openAvailability}
      value={availability}
      items={availabilityOpts}
      textStyle={{
        // fontFamily: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif'
      }}
      setOpen={setOpenAvailability}
      setValue={setAvailability}
      setItems={setAvailabilityOpts}
      onChangeValue={(value) => {
        setAvailability(value)
      }}
    />
    </View>

      
    <View style={styles.imageContainer}>
      {selectedImage && <Image source={selectedImage} style={styles.image} />}
      <Button title="Select Image" onPress={selectImage} />
      <Text>{message}</Text>
    </View>
      <Btn
        disabled={status !== "not added"}
        mode="contained"
        onPress={handleSubmit}
        style={{ marginTop: 24, marginBottom: 50, width: "70%" }}
      >
        {/* <Ionicons name='checkmark' size={5} /> */}
        {status === "added"?"Product Added":"Add Product"}
      </Btn>
        </KeyboardAwareScrollView>
      </View>

  );
};

export default UploadImageView;

const styles = StyleSheet.create({
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
    paddingHorizontal: 20
  },
  inputContainer: {
    alignItems: "center",
    paddingHorizontal: 40,
    marginTop: 20
  },
  dropdownContainer: {
    flex: 1,
    marginVertical: 8,
    paddingTop: 5
  },
  dropdown: {
    borderColor: "#999",
    borderRadius: 4,
  },
  imageContainer: {
    width: "100%",
    flex: 1,
    alignItems: "center",
    marginVertical: 10
  },
  image: {
    // width: 300,
    aspectRatio: "4/3",
    height: 200,
    objectFit: "contain",
    padding: 5,
    marginVertical: 5
  },
})