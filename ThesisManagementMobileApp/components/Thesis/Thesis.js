import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import MyStyle from "../../styles/MyStyle";
import Style from "./Style";
import { useContext, useEffect, useState } from "react";
import MyContext from "../../configs/MyContext";
import { authAPI, endpoints } from "../../configs/API";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { printToFileAsync } from "expo-print";
import { shareAsync } from "expo-sharing";

const Thesis = ({ route }) => {

    const [thesis, setThesis] = useState(null)
    const [criteria, setCriteria] = useState(null)
    const [user,] = useContext(MyContext)
    const { thesisId } = route.params;
    const [isShow, setIsShow] = useState(true)
    const [scores, setScores] = useState(null)
    const [isScores, setIsScores] = useState([])
    const [changeScores, setChangeScores] = useState([])
    const [getScore, setGetScore] = useState([])
    const [refresh, setRefresh] = useState(false)

    const handleReload = () => {
        setRefresh((prevRefresh) => !prevRefresh);
    }

    useEffect(() => {
        setIsShow(true)
        const loadThesis = async () => {
            try {
                let accessToken = await AsyncStorage.getItem('access-token')
                let res = await authAPI(accessToken).get(endpoints['thesis-detail'](thesisId));
                setThesis(res.data)
            } catch (ex) {
                console.error(ex);
            }
        }
        loadThesis();

        if (user.role === 'lecturer' || user.role === 'academic_manager') {
            const loadCriteria = async () => {
                try {
                    let accessToken = await AsyncStorage.getItem('access-token')
                    let res = await authAPI(accessToken).get(endpoints['criteria'])
                    setCriteria(res.data)
                } catch (ex) {
                    console.error(ex)
                }
            }
            loadCriteria();
        }

        if (user.role === 'lecturer') {
            const LoadScores = async () => {
                try {
                    let accessToken = await AsyncStorage.getItem('access-token')
                    let res = await authAPI(accessToken).get(endpoints['scoring'](thesisId))

                    setIsScores(res.data)
                } catch (ex) {
                    console.error(ex)
                }
            }
            LoadScores()
        }
    }, [thesisId, refresh])

    const show = () => {
        setIsShow(!isShow)
    }

    const createForm = (id, value) => {
        setScores(current => {
            return {
                ...current, [id - 1]: {
                    'criteria_id': id,
                    'score': value
                }
            }
        })
    }

    const scoring = () => {
        try {
            criteria.forEach(async criteria => {
                let accessToken = await AsyncStorage.getItem('access-token')
                let res = await authAPI(accessToken).post(endpoints['scoring'](thesisId), scores[criteria.id - 1])

                setThesis(res.data)
            })

            Alert.alert(
                'Hoàn tất',
                'Thêm điểm thành công!',
                [
                    { text: 'OK', onPress: () => console.log('OK') }
                ],
                { cancelable: true }
            )

            setScores([])
            setIsShow(true)
            handleReload()
        } catch (ex) {
            Alert.alert(
                'Xác nhận',
                'Thêm điểm không thành công!',
                [
                    { text: 'OK', onPress: () => console.log('OK') }
                ],
                { cancelable: true }
            )
            console.error(ex)
        }
    }

    const test = () => {
        if (isScores.length === 0) {
            return true
        }
        else {
            let isTest = true
            for (i = 0; i < isScores.length; i++) {
                if (isScores[i].lecturer_id === user.id) {
                    isTest = false
                    break
                }
            }
            return isTest
        }
    }

    const change = (criteria_id, score) => {
        for (i = 0; i < isScores.length; i++) {
            if (isScores[i].lecturer_id === user.id && isScores[i].criteria.id === criteria_id) {
                isScores[i].score = score
                setChangeScores(current => {
                    return {
                        ...current, [i]: {
                            'score_id': isScores[i].id,
                            'score': isScores[i].score
                        }
                    }
                })
                break
            }
        }
    }

    const changing = () => {
        try {
            for (let i in changeScores) {
                const scoring = async (score) => {
                    try {
                        let accessToken = await AsyncStorage.getItem('access-token')
                        let res = await authAPI(accessToken).patch(endpoints['scoring'](thesisId), score)

                        console.info(res.data)
                    } catch (ex) {
                        console.error(ex);
                    }
                }
                scoring(changeScores[i])
            }

            Alert.alert(
                'Hoàn tất',
                'Chỉnh sủa điểm thành công!',
                [
                    { text: 'OK', onPress: () => console.log('OK') }
                ],
                { cancelable: true }
            )

            setChangeScores([])
            setIsShow(true)
            handleReload()
        } catch (ex) {
            Alert.alert(
                'Xác nhận',
                'Chỉnh sửa điểm không thành công!',
                [
                    { text: 'OK', onPress: () => console.log('OK') }
                ],
                { cancelable: true }
            )
            console.error(ex)
        }
    }

    const getScores = async (memberId, thesisId) => {
        try {
            let accessToken = await AsyncStorage.getItem('access-token')
            let res = await authAPI(accessToken).get(endpoints['get-scores'](memberId, thesisId))

            setGetScore(res.data)
            // getScores(member.id, thesis.id)}
            //                 ${getScore.map(score =>
            //                     `<tr><td>${score.criteria.name}</td><td>${score.score}</td></tr>`
            //                 ).join().replaceAll(",", "")
        } catch (ex) {
            console.error(ex)
        }
    }

    const average = (lecturer_id) => {
        let average = 0.0
        thesis.scores.filter(score => score.lecturer_id === lecturer_id)
            .forEach(score => average += score.score)
        average = average / criteria.length

        return average
    }

    const toPDF = async () => {
        const html = `
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    padding: 50px;
                    font-size: 16;
                }

                h1, h2, h3 {
                    font-size: 16;
                }

                .center-tittle {
                    color: blue;
                    text-align: center;
                    text-transform: uppercase;
                }

                .center-table {
                    width: 90%;
                    margin: auto;
                }

                table {
                    border: 1px solid black;
                    border-collapse: collapse;
                    width: 100%;
                }

                th, td {
                    border: 2px solid black;
                    border-collapse: collapse;
                    text-align: center;
                    padding: 5;
                }
            </style>
        </head>
        
        <body style="padding: 50px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <h1 style="width: 100%; text-align: center; color: red; text-transform: uppercase;">BẢN ĐIỂM ${thesis.name}</h1>
            <div style="display: flex; flex-direction: row;">
                <h2>Sinh viên: </h2>
                <div style="margin-left: 5px;">
                    ${thesis.students.map(student => `<h2>${student.fullname}</h2>`)}
                </div>
            </div>
            <div style="display: flex; flex-direction: row;">
                <h2>Giảng viên hướng dẫn: </h2>
                <div style="margin-left: 5px;">
                    ${thesis.lecturers.map(lecturer => `<h2>${lecturer.fullname}</h2>`)}
                </div>
            </div>
            <h2>Khoa: ${thesis.students[0].faculty.name}</h2>
            <h2>Ngành: ${thesis.students[0].major.name}</h2>
            <h2>Hội đồng chấm: ${thesis.committee.name}</h2>
            <h2>Điểm trung bình: ${thesis.average}</h2>
            <h2 class='center-tittle'>ĐIỂM TỪNG GIẢNG VIÊN TRONG HỘI ĐỒNG</h1>
            ${thesis.committee.members.map(member =>
            `<h2>${member.role}: ${member.lecturer.fullname}</h2>
                <div class="center-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Tiêu chí
                                </th>
                                <th>Điểm</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${thesis.scores.filter(score => score.lecturer_id === member.lecturer.id)
                .map(score => `<tr><td>${score.criteria.name}</td><td>${score.score}</td></tr>`)
                .join().replaceAll(",", "")
            }
                        </tbody>
                        <tfoot>
                            <tr>
                                <th>Điểm trung bình</th>
                                <th>${average(member.lecturer.id)}</th>
                            </tr>
                        </tfoot>
                    </table>
                </div>`
        )}
        </body>
        </html>
        `
        const file = await printToFileAsync({
            html: html,
            base64: false
        })

        await shareAsync(file.uri)
    }

    return (
        <ScrollView contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 16 }}>
            {thesis === null ? <ActivityIndicator /> : <>
                <Text style={[Style.title]}>{thesis.name}</Text>
                <Text style={[Style.item]}>Điểm: {thesis.average}</Text>
                <View>
                    <Text style={[Style.item]}>Sinh viên thực hiện: {thesis.id}</Text>
                    <Text style={[Style.item]}>Sinh viên thực hiện: {thesis.students.map(student => student.fullname)}</Text>
                    <Text style={[Style.item]}>Giảng viên hướng dẫn: {thesis.lecturers.map(lecturer => lecturer.fullname)}</Text>
                    <Text style={[Style.item]}>Hội đồng bảo vệ: {thesis.committee ? thesis.committee.id : 'Chưa thêm hội đồng'}</Text>
                    <Text style={[Style.item]}>Ngành: {thesis.students[0].major.name}</Text>
                    <Text style={[Style.item]}>Khoa: {thesis.students[0].faculty.name}</Text>
                </View>

                {user.role === 'lecturer' && thesis.committee.active ? <>
                    {test() ? <>
                        {isShow ? <>
                            <View style={{ alignItems: 'center', width: '100%', marginVertical: 10, display: isShow ? 'flex' : 'none' }}>
                                <TouchableOpacity style={[Style.button]} onPress={() => { show(); }}>
                                    <Text style={Style.text}>Chấm điểm</Text>
                                </TouchableOpacity>
                            </View>
                        </> : <>
                            <View style={[MyStyle.container, { width: '100%', display: isShow ? 'none' : 'flex' }]}>
                                <Text style={Style.title}>Chấm điểm</Text>
                                {criteria === null ? <ActivityIndicator /> : <>
                                    {criteria.map(criteria => (
                                        <View style={[MyStyle.elevation, MyStyle.mb_20, Style.card, { width: '100%' }]}>
                                            <Text style={[Style.subject]}>{criteria.name}</Text>
                                            <TextInput maxLength={2} inputMode="decimal" style={[Style.input]} onChangeText={t => createForm(criteria.id, parseFloat(t))} placeholder="Nhập điểm" />
                                        </View>
                                    ))}
                                </>}
                                <View style={[MyStyle.row, { alignItems: 'center', justifyContent: 'space-between', width: '100%', marginVertical: 10 }]}>
                                    <TouchableOpacity style={[Style.button, { width: '45%' }]} onPress={scoring}>
                                        <Text style={Style.text}>Lưu</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[Style.button, { width: '45%', backgroundColor: 'orange' }]} onPress={() => show()}>
                                        <Text style={Style.text}>Hủy</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </>}
                    </> : <>
                        <View style={[{ alignItems: 'center', justifyContent: 'space-between', width: '100%', marginVertical: 10 }]}>
                            <View style={[Style.button, MyStyle.mb_20, { backgroundColor: 'green' }]}>
                                <Text style={Style.text}>ĐÃ CHẤM ĐIỂM</Text>
                            </View>

                            {isShow ? <>
                                <TouchableOpacity style={[Style.button, { width: '100%' }]} onPress={() => { show(); }}>
                                    <Text style={Style.text}>Chỉnh sửa</Text>
                                </TouchableOpacity>
                            </> : <>
                                <View style={[MyStyle.container, { width: '100%', display: isShow ? 'none' : 'flex' }]}>
                                    <Text style={Style.title}>Chỉnh sửa điểm</Text>
                                    {criteria === null ? <ActivityIndicator /> : <>
                                        {criteria.map(criteria => (
                                            <View style={[MyStyle.elevation, MyStyle.mb_20, Style.card, { width: '100%' }]}>
                                                <Text style={[Style.subject]}>{criteria.name}</Text>
                                                <TextInput maxLength={2} inputMode="decimal" style={[Style.input]} onChangeText={t => change(criteria.id, parseFloat(t))} placeholder="Nhập điểm" />
                                            </View>
                                        ))}
                                    </>}
                                    <View style={[MyStyle.row, { alignItems: 'center', justifyContent: 'space-between', width: '100%', marginVertical: 10 }]}>
                                        <TouchableOpacity style={[Style.button, { width: '45%' }]} onPress={changing}>
                                            <Text style={Style.text}>Lưu</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[Style.button, { width: '45%', backgroundColor: 'orange' }]} onPress={() => { show(); }}>
                                            <Text style={Style.text}>Hủy</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </>}
                        </View>
                    </>}
                </> : <></>}

                {user.role === 'academic_manager' && !thesis.committee.active ? <>
                    <View style={[{ alignItems: 'center', width: '90%', marginVertical: 10 }]}>
                        <TouchableOpacity style={[Style.button, { width: '100%' }]} onPress={toPDF}>
                            <Text style={Style.text}>Xuất file PDF</Text>
                        </TouchableOpacity>
                    </View>
                </> : <></>}
            </>}
        </ScrollView>)
}

export default Thesis;