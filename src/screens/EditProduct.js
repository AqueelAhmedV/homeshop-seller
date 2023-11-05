import React, { useEffect, useState } from 'react';
import { View, Image, Text, Button, Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';
import { BASE_URL } from '../constants/endpoints';
import Background from '../components/Background';
import TextInput from '../components/TextInput';
import BackButton from '../components/BackButton';
import Header from '../components/Header';
// import ModalDropdown from 'react-native-modal-dropdown';
import DropDownPicker from 'react-native-dropdown-picker';
// import { Ionicons } from '@expo/vector-icons';
import Btn from '../components/Button';
// import { SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { LogBox } from 'react-native';
import { StyleSheet } from 'react-native';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { theme } from '../core/theme';
import { windowWidth, windowHeight } from '../constants/dimensions'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const UploadImageView = ({ navigation, route }) => {
  const { _productName, _mrp, _offerPrice, _description, _imageId, _prodUnit, _category, _availability, _productId } = route.params
  console.log(route.params)
  const [selectedImage, setSelectedImage] = useState(null);
  const [message, setMessage] = useState('');
  const [productName, setProductName] = useState({value: _productName, error: ""})
  
  const [mrp, setMrp] = useState({value: _mrp, error: ""})
  const [offerPrice, setOfferPrice] = useState({value: _offerPrice, error: ""})
  const [description, setDescription] = useState(_description)
  const [prodUnit, setProdUnit] = useState({value: _prodUnit, error: ""})
  const [openCategories, setOpenCategories] = useState(false);
  const [categoryOpts, setCategoryOpts] = useState([]);
  const [category, setCategory] = useState(_category)
  const [openAvailability, setOpenAvailability] = useState(false);
  const [availabilityOpts, setAvailabilityOpts] = useState([{
    label: "Available",
    value: true
  }, {
    label: "Not Available",
    value: false
  }])
  const [availability, setAvailability] = useState(_availability)
  const [status, setStatus] = useState("not added")

  const imageUrl = `${BASE_URL}/api/product/view-image/${_imageId}?time=${Date.now()}`

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
        SellerId: seller.SellerId,
        ProductId: _productId,
        ImageId: _imageId
      }))
      axios.post(`${BASE_URL}/api/product/edit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    .then((res) => {
      console.log(res.data)
      setStatus("added")
      Alert.alert("Success","Details saved successfully", [
        {
          text: "OK",
          style: "cancel",
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{name: "Dashboard"},{name: "ManageProducts"}]
            })
          }
        }
      ], {
        cancelable: true,
        onDismiss: () => {
          navigation.reset({
            index: 0,
            routes: [{name: "Dashboard"},{name: "ManageProducts"}]
          })
        }
      })
    }).catch((err) => {
      setStatus("not added")
      console.log(JSON.stringify(err))
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

  const deleteProduct = () => {
    axios.post(`${BASE_URL}/api/product/delete`, {
      ProductId: _productId,
      ImageId: _imageId
    }).then((res) => {
      console.log(res.data)
      Alert.alert("Success","Product Deleted", [
        {
          text: "OK",
          style: "cancel",
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{name: "Dashboard"},{name: "ManageProducts"}]
            })
          }
        }
      ], {
        cancelable: true,
        onDismiss: () => {
          navigation.reset({
            index: 0,
            routes: [{name: "Dashboard"},{name: "ManageProducts"}]
          })
        }
      })
    }).catch((err) => {
      console.log(err)
    })
  }

  const handleDeleteProduct = () => {
    Alert.alert("Confirm Delete?", "Do you want to delete this product?", [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Delete",
        style: "default",
        onPress: () => {
          deleteProduct()
        }
      }
    ])
    
  }

  return (

    <View style={styles.page}>
      <View style={styles.navbar}>
      <View style={styles.headerContainer}>
           <TouchableOpacity  onPress={() => navigation.goBack()}>
              <AntDesign name="left" size={25} color="white" />
            </TouchableOpacity>
            <View style={{
                alignItems: "center",
                width: "76%"
            }}>
                <Text style={{
                    fontWeight: "bold",
                    fontSize: 24,
                    color: "#fff",
                    paddingLeft: 10
                }}>{"Edit Details"}</Text>
            </View>
          
          <TouchableOpacity onPress={handleDeleteProduct}>
          <MaterialIcons name="delete-outline" size={30} color={"#fff"}/>
        </TouchableOpacity>  
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
      dropDownContainerStyle={{borderColor: "#999"}}
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
      dropDownContainerStyle={{borderColor: "#999"}}
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
      {(selectedImage || !!_imageId) && <Image source={selectedImage || {uri: imageUrl}} style={styles.image} />}
      <Button title="Change Image" onPress={selectImage} />
      <Text>{message}</Text>
    </View>
      <Btn
        disabled={status !== "not added"}
        mode="contained"
        onPress={handleSubmit}
        style={{ marginTop: 24, marginBottom: 50, width: "70%" }}
      >
        {/* <Ionicons name='checkmark' size={5} /> */}
        {status === "added"?"Saved":"Save Details"}
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
    justifyContent: "space-around",
    paddingHorizontal: 15
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 65,
    justifyContent: "space-between",
    width: "85%"
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
  }
})