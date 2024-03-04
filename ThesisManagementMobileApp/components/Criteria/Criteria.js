import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { authAPI, endpoints } from "../../configs/API";
import MyStyle from "../../styles/MyStyle";
import Style from "./Style";

const Criteria = () => {
    const [criteria, setCriteria] = useState(null)
    const [isHidden, setIsHidden] = useState(true);
    const [name, setName] = useState('');
    const [refresh, setRefresh] = useState(false)

    const handleReload = () => {
        setRefresh((prevRefresh) => !prevRefresh);
      }

    useEffect(() => {
        const loadCriteria = async () => {
            try {
                let accessToken = await AsyncStorage.getItem('access-token')
                //sửa lại token
                let res = await authAPI(accessToken).get(endpoints['criteria'])
                console.info(res.data)
                setCriteria(res.data)
            } catch (ex) {
                console.error(ex);
            }
        }

        loadCriteria()
    }, [refresh])

    const createCriteria = async () => {
        try {
            let accessToken = await AsyncStorage.getItem('access-token');
            const data = {
                name: name,
            };

            let res = await authAPI(accessToken).post(endpoints['criteria'], data);

            Alert.alert(
                'Hoàn tất',
                'Thay đổi thành công!',
                [
                    { text: 'OK', onPress: () => console.log('OK') }
                ],
                { cancelable: true }
            )
            handleReload();
            
        } catch (error) {
            console.error(error);
        }
        
    };

    const toggleVisibility = () => {
        setIsHidden(!isHidden);
    };

    const handleCriteriaChange = (text) => {
        setName(text);
    };

    return (

        <View>
            {isHidden ? <>
                <View style={{ width: '100%', justifyContent: 'center', marginVertical: 10, alignItems: 'center' }}>
                    <TouchableOpacity onPress={toggleVisibility} style={[Style.button, { width: "90%" }]}>
                        <Text style={Style.text}>Thêm Tiêu Chí Mới</Text>
                    </TouchableOpacity>
                </View>
            </> : <>
                <View style={{ width: '100%', justifyContent: 'center', marginVertical: 10, alignItems: 'center' }}>
                    <Text style={Style.subject}>Nhập tên tiêu chí:</Text>
                    <TextInput style={[Style.input, { marginVertical: 10 }]} onChangeText={t => handleCriteriaChange(t)} />
                    <View style={[MyStyle.row, { width: '90%', alignItems: 'center', justifyContent: 'space-between' }]}>
                        <TouchableOpacity style={[Style.button, { width: "40%", backgroundColor: "#FF4D4D" }]} onPress={createCriteria}>
                            <Text style={Style.text}>Lưu</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[Style.button, { width: '40%', backgroundColor: 'orange' }]} onPress={toggleVisibility}>
                            <Text style={Style.text}>Hủy</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </>}
            <View style={{height: isHidden ? '90%' : '77%', paddingVertical: 10}}>
                <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
                    {criteria === null ? <ActivityIndicator /> : <>
                        {criteria.map(criteria => (
                            <Text key={criteria.id} style={[MyStyle.mb_20, MyStyle.elevation, Style.subject, Style.card]}>Tiêu Chí {criteria.id}: {criteria.name}</Text>
                        ))}
                    </>}
                </ScrollView>
            </View>
        </View>
    )
}

export default Criteria;