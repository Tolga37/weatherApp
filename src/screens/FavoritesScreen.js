import { Text, View, StyleSheet, Pressable, Dimensions, Button, SafeAreaView, FlatList, Linking, TextInput, Alert } from 'react-native';
import React, { useState, useEffect } from "react";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import firestore from '@react-native-firebase/firestore';
import axios from 'axios';
import { login, logOut, appointInfo } from "../redux/actions/loginActions";
import { useDispatch, useSelector } from "react-redux";
import { useIsFocused } from '@react-navigation/native';

const { width, height } = Dimensions.get("window");

export default function HomeScreen({ navigation }) {
    FontAwesome.loadFont();

    const isFocused = useIsFocused();
    const [data, setData] = useState(null)
    const [newData, setNewData] = useState(null)
    const [refresh, setRefresh] = useState(true)
    const number = useSelector((state) => state.login.number)
    const favorites = useSelector((state) => state.login.favorites)
    const isLogin = useSelector((state) => state.login.isLogin)
    const dispatch = useDispatch();

    const setFirebase = async (data) => {
        let temp = favorites
        temp[data] = !temp[data]
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

    const renderItem = ({ item, index }) => {
        return (
            favorites[index] && <Pressable onPress={() => navigation.navigate('Detail', { id: index })} style={styles.moneyView} >
                <Text style={styles.itemStyle}>{item}</Text>
                <FontAwesome name={favorites[index] ? 'minus' : 'plus-circle'} size={25} color="#d62828" onPress={() => setFirebase(index)} />
            </Pressable>
        )
    }

    const provinceData = ["Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan", "Artvin", "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Iğdır", "Isparta", "İstanbul", "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kırıkkale", "Kırklareli", "Kırşehir", "Kilis", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Şanlıurfa", "Şırnak", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak"]

    return (
        <SafeAreaView style={styles.container}>
            {isLogin &&
                <FlatList
                    data={provinceData}
                    renderItem={renderItem}
                    keyExtractor={index => index.toString()}
                    extraData={refresh}
                />

            }

        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',

    },
    moneyView: {
        backgroundColor: '#fff',
        marginHorizontal: 10,
        marginTop: 10,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    itemStyle: {
        fontSize: 20,
        fontWeight: '500',
        color: '#000'
    }

});