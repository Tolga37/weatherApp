import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useIsFocused } from '@react-navigation/native';
import axios from 'axios';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"

export default function Detail({ navigation, route }) {

    const [data, setData] = useState(null)
    const provinceData = ["Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan", "Artvin", "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Iğdır", "Isparta", "İstanbul", "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kırıkkale", "Kırklareli", "Kırşehir", "Kilis", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Şanlıurfa", "Şırnak", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak"]
    const isFocused = useIsFocused();

    const getData = async () => {
        await axios.get('http://api.weatherstack.com/current?access_key=8d1c2c4608e729d98b7c5b08520699a6&query=' + provinceData[route.params.id])
            .then(async (res) => {
                console.log('XXX', res.data)
                await setData(res.data)
            })
            .catch((e) => {
                console.log("Axios Error", e)
            })
    }

    useEffect(() => {
        isFocused ? getData() : setData(null)
    }, [isFocused])

    return (
        <View style={styles.container}>
            {data && data.current && data.current.weather_descriptions ?
                <View style={styles.page}>
                    <Text style={styles.name}>{provinceData[route.params.id]}</Text>
                    <View style={styles.iconView}>
                        <MaterialCommunityIcons style={styles.icon}
                            name={data.current.weather_descriptions[0].includes('cloudy') ? 'weather-cloudy' :
                                data.current.weather_descriptions[0].includes('clear') ? 'weather-cloudy' :
                                    data.current.weather_descriptions[0].includes('rain') ? 'weather-pouring' :
                                        data.current.weather_descriptions[0].includes('Sunny') ? 'weather-sunny' : 'weather-cloudy'

                            } size={200} color={'#ffb700'} />
                    </View>
                    <View style={styles.bottom}>
                        <Text style={styles.degreeText}>{data.current.temperature}°</Text>
                        <Text style={styles.text}>
                            {data.current.weather_descriptions[0].includes('cloudy') ? 'BULUTLU' :
                                data.current.weather_descriptions[0].includes('clear') ? 'AÇIK' :
                                    data.current.weather_descriptions[0].includes('rain') ? 'YAĞMURLU' :
                                        data.current.weather_descriptions[0].includes('Sunny') ? 'GÜNEŞLİ' : 'BULUTLU'}
                        </Text>
                    </View>
                </View>
                : null}
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:'#fff'
    },
    iconView: {
        flex: 1
    },
    page: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1
    },
    bottom: {
        flex: 2
    },
    degreeText: {
        fontWeight: 'bold',
        fontSize: 25,
        color: '#ffb700',
        textAlign: 'center',
    },
    name: {
        fontWeight: 'bold',
        fontSize: 25,
        color: '#000',
        textAlign: 'center',
        marginVertical:20
    },
    text:{
        fontSize: 20,
        color: '#d62828',
        textAlign: 'center',
        marginTop:20,
        fontWeight: 'bold',
    }
})