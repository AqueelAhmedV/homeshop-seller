import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { BASE_URL } from '../constants/endpoints';
import Background from '../components/Background';
import Header from '../components/Header';
import BackButton from '../components/BackButton';


const ProductList = ({ navigation }) => {
  const [products, setProducts] = useState([]);


  const fetchData = () => {
    AsyncStorage.getItem("sellerId")
    .then((sellerId) => {
        console.log(sellerId)
        axios.get(`${BASE_URL}/api/product/list-seller/${sellerId}`)
      .then((response) => {
        console.log(response.data)
        setProducts(response.data);
      })
      .catch((error) => {
        console.log(JSON.stringify(error.response));
      });
    })
  }

  useEffect(() => {
    // Fetch data using Axios
   fetchData()
  }, []);

  const handleProductClick = (product) => {
    console.log(product)
    navigation.navigate("EditProduct", {
      _productName: product.ProductName,
      _description: product.Description,
      _prodUnit: product.ProductionUnit,
      _mrp: product.MRP + "",
      _offerPrice: product.OfferPrice? product.OfferPrice + "": "",
      _imageId: product.ImageId,
      _availability: product.Availability,
      _category: product.Category,
      _productId: product.ProductId,
    })
    // Handle click on a product
    // You can navigate to a product detail screen or show more information here
    console.log(`Clicked on product: ${product.ProductName}`);
  };

  const renderProductItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleProductClick(item)}>
      <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.ProductName}</Text>
        <Text>MRP: &#8377;{item.MRP}</Text>
        <Text>Production Unit: {item.ProductionUnit}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    
    <Background>
      <BackButton goBack={navigation.goBack} />
      <Header>{"Manage Products"}</Header>
      {products.length === 0 ? (
        <View style={{padding: 40, }}>
        <Text style={{fontWeight: 500}}>No products to show</Text>
        </View>
        ):
    <FlatList
      style={{
        width: "100%",
        flex: 1
      }}
      data={products}
      renderItem={renderProductItem}
      keyExtractor={(item) => item.ProductId.toString()}
    />}
    </Background>
  );
};

export default ProductList;