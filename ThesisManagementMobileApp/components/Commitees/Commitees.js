import { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import MyStyle from "../../styles/MyStyle";
import Style from "./Style";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI, endpoints } from "../../configs/API";


const Committees = ({ navigation }) => {

    const [committees, setCommittees] = useState(null)
    const [refresh, setRefresh] = useState(false)

    const handleReload = () => {
      setRefresh((prevRefresh) => !prevRefresh);
    }

    useEffect(() => {
        const loadCommittees = async () => {
            try {
                let accessToken = await AsyncStorage.getItem('access-token')
                let res = await authAPI(accessToken).get(endpoints['committees'])
                setCommittees(res.data)
            }
            catch (error) {
                console.error(error)
            }
        }
        // console.info(committees)
        loadCommittees();
    }, [refresh]);

    const detail = (committee) => {
        navigation.navigate('CommitteesDetail', { 'committee': committee })
        setRefresh(true)
    }

    const addCommittees = () => {
        navigation.navigate('AddCommittees')
        setRefresh(true)
    }
    
    const close = async (committeeId) => {
        try {
            let accessToken = await AsyncStorage.getItem('access-token')
            let res = await authAPI(accessToken).patch(endpoints['close-committee'](committeeId))

            Alert.alert (
                'Hoàn tất',
                'Đóng/mở luận thành công!',
                [
                    { text: 'OK', onPress: () => console.log('OK')}
                ],
                { cancelable: true }
            )

        } catch (ex) {
            Alert.alert(
                'Xác nhận',
                'Thêm khóa luận không thành công!',
                [
                    {text: 'OK', onPress: () => console.log('OK')}
                ],
                {cancelable: true}
            )
            console.error(ex)
        }
        handleReload()
    }

    return (
        <View style={{ flex: 1 }}>
            <View style={{ height: '90%' }}>
                <ScrollView contentContainerStyle={{ alignItems: 'center', marginTop: 20, paddingBottom: 10 }}>
                    {committees === null ? <ActivityIndicator /> : <>
                        {committees.map(committee => (
                            <TouchableOpacity key={committee.id} onPress={() => detail(committee)} style={[Style.card, MyStyle.mb_20, MyStyle.row, { justifyContent: 'space-between' }]}>
                                <View>
                                    <Text style={[Style.text]}>{committee.name}</Text>
                                    <Text style={[Style.item]}>Thành viên:</Text>
                                    {committee.members && committee.members.map((member, memberIndex) => (
                                        <View key={memberIndex}>
                                            <Text>{member.lecturer.fullname}</Text>
                                        </View>
                                    ))}
                                </View>
                                {committee.active ? <>
                                    <View style={{ width: '40%', justifyContent: 'center' }}>
                                        <TouchableOpacity style={[Style.button, { backgroundColor: 'red' }]} onPress={() => close(committee.id)}>
                                            <Text style={[Style.text, { color: 'white' }]}>Đóng</Text>
                                        </TouchableOpacity>
                                    </View>
                                </> : <>
                                    <View style={{ width: '40%', justifyContent: 'center' }}>
                                        <TouchableOpacity style={[Style.button, { backgroundColor: 'green' }]} onPress={() => close(committee.id)}>
                                            <Text style={[Style.text, { color: 'white' }]}>Mở</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>}
                            </TouchableOpacity>
                        ))}
                    </>}
                </ScrollView>
            </View>
            <View style={{ width: '100%', justifyContent: 'center', flex: 1, alignItems: 'center' }}>
                <TouchableOpacity style={[Style.button, { width: '90%' }]} onPress={() => addCommittees()}>
                    <Text style={[Style.text, { color: 'white' }]}>Thêm hội đồng</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default Committees;