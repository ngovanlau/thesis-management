import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import DropDownPicker from 'react-native-dropdown-picker';
import { authAPI, endpoints } from "../../configs/API";
import Style from "./Style";
import MyStyle from "../../styles/MyStyle";

const AddThesis = ({navigation}) => {

    const [studentOpen, setStudentOpen] = useState(false);
    const [student, setStudent] = useState([]);
    const [students, setStudens] = useState([]);

    const [lecturerOpen, setLecturerOpen] = useState(false);
    const [lecturer, setLecturer] = useState([]);
    const [lecturers, setLecturers] = useState([]);

    const [committeeOpen, setCommitteeOpen] = useState(false);
    const [committee, setCommittee] = useState(null);
    const [committees, setCommittees] = useState([]);

    const [thesis, setThesis] = useState({
        'name': '',
        'students': [],
        'lecturers': [],
        'committee': {}
    })

    const [refresh, setRefresh] = useState(false)

    const handleReload = () => {
        setRefresh((prevRefresh) => !prevRefresh);
    }


    useEffect(() => {
        const loadStudents = async () => {
            let accessToken = await AsyncStorage.getItem('access-token')
            let res = await authAPI(accessToken).get(endpoints['students'])

            let students = res.data.filter(student => student.thesis_id === null)
            students = students.map(student => ({ label: student.fullname, value: student.id, thesis: student.thesis_id}))
            
            setStudens(students)
        }
        loadStudents();

        const loadLecturers = async () => {
            let accessToken = await AsyncStorage.getItem('access-token')
            let res = await authAPI(accessToken).get(endpoints['lecturers'])
            let lecturers = res.data.map(lecturer => ({ label: lecturer.fullname, value: lecturer.id }))
            setLecturers(lecturers)
        }
        loadLecturers();

        const loadCommittees = async () => {
            let accessToken = await AsyncStorage.getItem('access-token')
            let res = await authAPI(accessToken).get(endpoints['committees'])

            let committees = res.data.filter(committee => committee.theses.length < 5)
            committees = committees.map(committee => ({ label: committee.name, value: committee.id }))
            
            setCommittees(committees)
        }
        loadCommittees();
    }, [refresh])

    const change = (t) => {
        setThesis(current => {
            return {...current, 'name': t}
        })
    }

    const changeStudents = () => {
        setThesis(current => {
            jsonStudents = student.map(id => ({
                'id': id
            }))
            return {...current, 'students': jsonStudents}
        })
    }

    const changeLecturers = () => {
        setThesis(current => {
            jsonLecturers = lecturer.map(id => ({
                'id': id
            }))
            return {...current, 'lecturers': jsonLecturers}
        })
    }

    const changeCommittee = () => {
        setThesis(current => {
            return {...current, 'committee': ({'id': committee})}
        })

    }

    console.info(thesis)

    const add = async () => {
        try {
            let accessToken = await AsyncStorage.getItem('access-token')
            let res = await authAPI(accessToken).post(endpoints['theses'], thesis)
            console.info(res.data.message)    

            Alert.alert (
                'Hoàn tất',
                'Thêm khóa luận thành công!',
                [
                    { text: 'OK', onPress: () => { setRefresh(true); navigation.navigate('Home');} }
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
    }

    return (
        <View style={[MyStyle.container, {justifyContent: 'flex-start', padding: 20}]}>
            <Text style={[Style.title]}>Thêm khóa luận</Text>
            <Text style={Style.subject}>Tên khóa luận</Text>
            <TextInput style={[Style.input, {marginBottom: 0, width: '95%'}]} value={thesis.name} onChangeText={t => change(t)} placeholder="Nhập tên khóa luận" />
            <Text style={Style.subject}>Sinh viên thực hiện:</Text>
            <DropDownPicker
                open={studentOpen}
                value={student}
                items={students}
                multiple={true}
                min={0}
                max={2}
                setOpen={setStudentOpen}
                setValue={setStudent}
                setItems={setStudens}
                textStyle={MyStyle.f_16}
                containerStyle={{
                    width: '95%',
                    borderWidth: 0
                }}
                dropDownContainerStyle={[MyStyle.elevation, {
                    borderWidth: 0,
                    zIndex: 300
                }]}
                style={[MyStyle.elevation, {
                    borderWidth: 0,
                    zIndex: 300
                }]}
                onChangeValue={changeStudents}
            />
            <Text style={Style.subject}>Giảng viên hướng dẫn:</Text>
            <DropDownPicker
                open={lecturerOpen}
                value={lecturer}
                items={lecturers}
                multiple={true}
                min={0}
                max={2}
                setOpen={setLecturerOpen}
                setValue={setLecturer}
                setItems={setLecturers}
                textStyle={MyStyle.f_16}
                containerStyle={{
                    width: '95%',
                    borderWidth: 0
                }}
                dropDownContainerStyle={[MyStyle.elevation, {
                    borderWidth: 0,
                    zIndex: 200
                }]}
                style={[MyStyle.elevation, {
                    borderWidth: 0,
                    zIndex: 200
                }]}
                onChangeValue={changeLecturers}
            />
            <Text style={Style.subject}>Hội đồng chấm khóa luận:</Text>
            <DropDownPicker
                open={committeeOpen}
                value={committee}
                items={committees}
                setOpen={setCommitteeOpen}
                setValue={setCommittee}
                setItems={setCommittees}
                textStyle={MyStyle.f_16}
                containerStyle={{
                    width: '95%',
                    borderWidth: 0
                }}
                dropDownContainerStyle={[MyStyle.elevation, {
                    borderWidth: 0,
                    zIndex: 100
                }]}
                style={[MyStyle.elevation, {
                    borderWidth: 0,
                    zIndex: 100
                }]}  
                onChangeValue={changeCommittee}    
            />

            <View style={{ alignItems: 'center', width: '95%', marginVertical: 30}}>
                <TouchableOpacity style={[Style.button]} onPress={add}>
                    <Text style={Style.text}>Thêm</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default AddThesis;