import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { authAPI, endpoints } from "../../configs/API";
import Style from "./Style";
import MyStyle from "../../styles/MyStyle";

const AddCommittees = ({navigation}) => {

    const [name, setName] = useState('');

    const [lecturers, setLecturers] = useState(null)
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [items, setItems] = useState([[]]);

    const [open1, setOpen1] = useState(false);
    const [value1, setValue1] = useState(null);
    const [items1, setItems1] = useState([[]]);

    const [open2, setOpen2] = useState(false);
    const [value2, setValue2] = useState(null);
    const [items2, setItems2] = useState([[]]);

    const [open3, setOpen3] = useState(false);
    const [value3, setValue3] = useState(null);
    const [items3, setItems3] = useState([[]]);

    const [open4, setOpen4] = useState(false);
    const [value4, setValue4] = useState(null);
    const [items4, setItems4] = useState([[]]);

    const [isHidden, setIsHidden] = useState(true);
    // const [memberCount, setMemberCount] = useState(1);

    const [refresh, setRefresh] = useState(false)

    const handleReload = () => {
      setRefresh((prevRefresh) => !prevRefresh);
    }

    useEffect(() => {

        const loadLecturers = async () => {
            try {
                let accessToken = await AsyncStorage.getItem('access-token')
                //sua lai access token
                let res = await authAPI(accessToken).get(endpoints['lecturers'])

                setLecturers(res.data)
                const lecturerItems = res.data.map((lecturer) => ({
                    value: lecturer.id,
                    key: lecturer.id.toString(),
                    label: lecturer.fullname,
                }));
                setItems(lecturerItems)
                setItems1(lecturerItems)
                setItems2(lecturerItems)
                setItems3(lecturerItems)
                setItems4(lecturerItems)
            }
            catch (error) {
                console.error(error)
            }
        }
        loadLecturers();
    }, [refresh])

    const createCommittee = async () => {
        try {
            let accessToken = await AsyncStorage.getItem('access-token');
            const data = {
                name: name,
                members: [
                    { lecturer: { id: value }, role: "chairman" },
                    { lecturer: { id: value1 }, role: "secretary" },
                    { lecturer: { id: value2 }, role: "critical_lecturer" },
                    
                ]
            };
            if(value3){
                data.members.push(
                    { lecturer: { id: value3 }, role: "member" },)
            }

            if(value4){
                data.members.push(
                    { lecturer: { id: value4 }, role: "member" },)
            }

            let res = await authAPI(accessToken).post(endpoints['committees'], data);
            
            Alert.alert(
                'Hoàn tất',
                'Thay đổi thành công!',
                [
                    { text: 'OK', onPress: () => {setRefresh(true); navigation.navigate('Committee');}}
                ],
                { cancelable: true }
            )
        } catch (error) {
            Alert.alert(
                'Lỗi',
                'Đã xảy ra lỗi!',
                [
                    { text: 'OK', onPress: () => console.log('error') }
                ],
                { cancelable: true }
            )
        }
    };

    const handleCancel = () => {
        setValue3(null);
        setOpen3(false);

        setValue4(null);
        setOpen4(false);
    };

    const toggleVisibility = () => {
        setIsHidden(!isHidden);
        handleCancel()
    };


    const handleNameChange = (text) => {
        setName(text);
    };


    return (
        <View style={{ padding: 20 }}>
            <Text style={Style.text}>Tên hội đồng:</Text>
            <TextInput style={[Style.input]} value={name} onChangeText={t => handleNameChange(t)} />
            <View key='1'>
                <Text style={Style.text}>Chủ tịch:</Text>
                <DropDownPicker style={[MyStyle.elevation, Style.picker, MyStyle.mb_20]} placeholder={'Chọn thành viên...'} open={open} value={value} items={items} setOpen={setOpen} setValue={setValue} setItems={setItems} />
                <Text style={Style.text}>Thư ký:</Text>
                <DropDownPicker style={[MyStyle.elevation, Style.picker, MyStyle.mb_20]} placeholder={'Chọn thành viên...'} open={open1} value={value1} items={items1} setOpen={setOpen1} setValue={setValue1} setItems={setItems1} />
                <Text style={Style.text}>Giảng viên phản biện:</Text>
                <DropDownPicker style={[MyStyle.elevation, Style.picker, MyStyle.mb_20]} placeholder={'Chọn thành viên...'} open={open2} value={value2} items={items2} setOpen={setOpen2} setValue={setValue2} setItems={setItems2} />
            </View>

            <TouchableOpacity onPress={toggleVisibility} style={[Style.button, MyStyle.mb_20, { display: isHidden ? 'flex' : 'none', width: '50%' }]}>
                <Text>Thêm thành viên</Text>
            </TouchableOpacity>
            <View style={{ display: isHidden ? 'none' : 'flex', width: '100%' }}>
                <Text style={Style.text}>Thành viên 1:</Text>
                <DropDownPicker style={[MyStyle.elevation, Style.picker, MyStyle.mb_20]} placeholder={'Chọn thành viên...'} open={open3} value={value3} items={items3} setOpen={setOpen3} setValue={setValue3} setItems={setItems3} />
                
                <Text style={Style.text}>Thành viên 2:</Text>
                <DropDownPicker style={[MyStyle.elevation, Style.picker, MyStyle.mb_20]} placeholder={'Chọn thành viên...'} open={open4} value={value4} items={items4} setOpen={setOpen4} setValue={setValue4} setItems={setItems4} />
                

                <View style={[MyStyle.mb_20, { flexDirection: 'row', justifyContent: 'space-between' }]}>
                    <TouchableOpacity style={[Style.button, MyStyle.mb_20, { width: '45%', backgroundColor: 'orange' }]} onPress={toggleVisibility}>
                        <Text>Hủy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={createCommittee} style={[Style.button, MyStyle.mb_20, { width: '45%', backgroundColor: "#FF4D4D" }]}>
                        <Text>Lưu</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <TouchableOpacity onPress={createCommittee} style={[Style.button, MyStyle.mb_20, { display: isHidden ? 'flex' : 'none', width: '50%', backgroundColor: "#FF4D4D"}]}>
                <Text>Lưu</Text>
            </TouchableOpacity>
        </View>
    )
}

export default AddCommittees;