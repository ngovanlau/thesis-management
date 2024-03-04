import { Image, Text, TextInput, TouchableOpacity, View, Alert } from "react-native"
import { ScrollView } from "react-native";
import MyContext from "../../configs/MyContext";
import { useContext, useEffect, useState, useRef } from "react";
import Style from "./Style";
import MyStyle from "../../styles/MyStyle";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI, endpoints } from "../../configs/API";

const Profile = ({ navigation }) => {
    const [pass, setPass] = useState({
        "password": "",
        "confirm_password": ""
    })

    const [refresh, setRefresh] = useState(false)

    const handleReload = () => {
        setRefresh((prevRefresh) => !prevRefresh);
    }

    const [user,] = useContext(MyContext)
    const [theses, setTheses] = useState([]);
    const [isHidden, setIsHidden] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            let accessToken = await AsyncStorage.getItem("access-token")
            let res = await authAPI(accessToken).get(endpoints['/users/current-user'])

            if (res.data.length !== 0) {
                setTheses(res.data)
            }
        }

        loadUser();
    }, [refresh])

    const toggleVisibility = () => {
        setIsHidden(!isHidden);
    };



    const changePassword = async () => {
        if (pass.password === pass.confirm_password) {
            let form = new FormData();

            for (let key in pass) {
                form.append(key, pass[key])
            }

            try {
                let accessToken = await AsyncStorage.getItem("access-token")
                let res = await authAPI(accessToken).patch(endpoints['change-password'], form, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                Alert.alert(
                    'Hoàn tất',
                    'Thay đổi thành công!',
                    [
                        { text: 'OK', onPress: () => console.log('OK') }
                    ],
                    { cancelable: true }
                )
                setRefresh(True)
                navigation.navigate("Home");

            } catch (ex) {
                console.error(ex);
            }
        } else {
            Alert.alert(
                'Mật khẩu không khớp!',
                'Vui lòng nhập và xác nhận mật khẩu giống nhau.',
                [
                    { text: 'OK', onPress: () => console.log('Mật khẩu không khớp') }
                ],
            )
        }


    }

    const change = (field, value) => {
        setPass(current => {
            return { ...current, [field]: value };
        });
    };


    return (
            <View style={[{flex: 1, alignItems: 'center', width: '100%', padding: 20}]}>
                <View style={[{alignItems: 'center', width: '100%' }]}>
                    <Text style={[Style.small_title]}>Thông Tin Tài Khoản:</Text>
                    <Image
                        source={{ uri: user.avatar }}
                        style={{ width: 200, height: 200, borderRadius: 100 }}
                    />

                    <View style={{alignItems: 'flex-start', width: '100%', marginTop: 20}}>
                        <Text style={[Style.item]}>Tên: {user.fullname}</Text>
                        <Text style={[Style.item]}>Username: {user.username}</Text>
                        <Text style={[Style.item]}>Email: {user.email}</Text>
                        <Text style={[Style.item]}>Khoa: {user.faculty.name}</Text>
                        {user.role === 'student' ? <>
                        <Text style={[Style.item]}>Khoa: {user.major}</Text>
                        </> : <></>}
                    </View>
                </View>

                {isHidden ? <>
                    <TouchableOpacity onPress={toggleVisibility} style={[Style.button, { width: '100%' }]}>
                        <Text style={Style.text}>Đổi mật khẩu</Text>
                    </TouchableOpacity>
                </> : <>
                    <View style={{ width: '100%' }}>
                        <TextInput value={pass.password} onChangeText={t => change("password", t)} secureTextEntry={true} placeholder="Nhập mật khẩu mới" style={[Style.input, MyStyle.mb_20, { width: '100%' }]} />
                        <TextInput value={pass.confirm_password} onChangeText={t => change("confirm_password", t)} secureTextEntry={true} style={[Style.input, MyStyle.mb_20, { width: '100%' }]} placeholder="Nhập lại mật khẩu mới" />
                        <View style={[MyStyle.row, { alignItems: 'center', justifyContent: 'space-between'}]}>
                            <TouchableOpacity onPress={() => changePassword(navigation)} style={[Style.button, { width: '45%' }]}>
                                <Text style={Style.text}>Xác nhận</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[Style.button, { width: '45%', backgroundColor: 'orange' }]} onPress={toggleVisibility}>
                                <Text style={Style.text}>Hủy</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </>}
            </View>
    )
}

export default Profile;