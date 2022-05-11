import { Text, View, StyleSheet, Pressable, Dimensions, Button, SafeAreaView, FlatList, Linking, TextInput, Alert } from 'react-native';
import React, { useState, useEffect } from "react";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import firestore from '@react-native-firebase/firestore';
import axios from 'axios';
import { login, logOut, appointInfo } from "../redux/actions/loginActions";
import { useDispatch, useSelector } from "react-redux";
import { useIsFocused } from '@react-navigation/native';
const { width, height } = Dimensions.get("window");
export default function HomeScreen() {
    FontAwesome.loadFont();
    const [data, setData] = useState()
    const [moneyKey, setMoneyKey] = useState()
    const [refresh, setRefresh] = useState(true)
    const [newData, setNewData] = useState()
    const [firebasedata, setFirebaseData] = useState([])
    const number = useSelector((state) => state.login.number)
    const favorites = useSelector((state) => state.login.favorites)
    const dispatch = useDispatch();
    
    const isFocused = useIsFocused();

    const config = {
        headers: {
            apikey: "8d1c2c4608e729d98b7c5b08520699a6" // ZoSa5lGLkMJmgvFOSbRQ85TQ8p6yk4Rh
            //57552d9daa6b6d53ea2cb956c728a7a2 yeni acces key

        }
    }
//'http://api.weatherstack.com/current?access_key=57552d9daa6b6d53ea2cb956c728a7a2&query=Zonguldak'
    const url = "http://api.weatherstack.com/current?access_key=8d1c2c4608e729d98b7c5b08520699a6&query=Zonguldak"
    const getData = async () => {
         await axios.get('http://api.weatherstack.com/current?access_key=57552d9daa6b6d53ea2cb956c728a7a2&query=Zonguldak')
        .then(async(res) => {
            console.log("GELEN",JSON.stringify(res,null,4))
        })
        .catch((e) => {
            console.log("Axios Error")
        })
    }

    useEffect(() => {
        isFocused && getData()
    }, [isFocused])

    const setFirebase = async (data) => {
        let temp = favorites
        temp[data] = temp[data] ? !temp[data] : true
        await firestore()
            .collection('users')
            .doc(number)
            .update({
                favorites: temp //[`${data}`]
                // value: value
            })
            .then(() => {
                dispatch(login({ favorites: temp }))
                setRefresh(!refresh)
            })
            .catch((e) => {
                console.log("ERROR:", e)
            })
    }

    const renderItem = ({ item, index }) => (
        <View style={styles.moneyView} >
            <Text style={styles.itemStyle}>{item[0]}         {item[1]} </Text>
            <FontAwesome name={favorites[item[0]] ? 'heart' : 'heart-o'} size={25} color="red" onPress={() => setFirebase(item[0])} />
        </View>
    )

    return (
        <SafeAreaView style={styles.container}>

            {moneyKey !== null ?
                <FlatList
                    data={newData}
                    renderItem={renderItem}
                    keyExtractor={index => index.toString()}
                    extraData={refresh}
                />
                :
                <Text style={styles.title}>Piyasa</Text>
            }

        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:"#012a4a",
        alignItems:"center",
        justifyContent:"center"
        
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',

    },
    moneyView: {
        borderWidth: 1,
        padding: 10,
        margin: 5,
        width: width / 1.05,
        height: height / 15,
        // justifyContent:"center",
        borderRadius: 5,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    itemStyle: {
        fontSize: 20
    }


});