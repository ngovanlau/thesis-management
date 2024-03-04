import { useEffect, useState } from "react";
import { View, Text, Image, ScrollView } from "react-native"
import Style from "./Style";
import MyStyle from "../../styles/MyStyle";


const CommiteesDetail = ({ route }) => {

    const { committee } = route.params;

    return (
        <ScrollView contentContainerStyle={{ alignItems: 'center', marginTop: 20, paddingBottom: 20 }}>
            <Text style={[Style.title]}>{committee.name}</Text>
            <Text style={[Style.text, MyStyle.mb_20]}>Thành viên:</Text>
            {committee.members && committee.members.map((member, idx) => (
                <View key={idx} style={[Style.card, MyStyle.mb_20, MyStyle.row, MyStyle.elevation, { width: '90%'}]}>
                    <Image source={{ uri: member.lecturer.avatar }} style={[{ width: 100, height: 100, borderRadius: 50}]} />
                    <View style={{marginLeft: 20}}> 
                        <Text style={[Style.text, {fontSize: 20}]}>{member.lecturer.fullname}</Text>
                        <Text style={[Style.text, {fontSize: 14}]}>Vai trò: {member.role}</Text>
                        <Text style={[Style.text, {fontSize: 14}]}>Khoa: {member.lecturer.faculty.name}</Text>
                    </View>
                </View>
            ))}
        </ScrollView>


    )
}

export default CommiteesDetail;