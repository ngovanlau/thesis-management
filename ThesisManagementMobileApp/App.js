import { createDrawerNavigator } from '@react-navigation/drawer';
import React, { useReducer } from 'react';
import UserReducer from './reducers/UserReducer';
import MyContext from "./configs/MyContext";
import { NavigationContainer } from '@react-navigation/native';
import Login from './components/User/Login';
import Home from './components/Home/Home';
import Thesis from './components/Thesis/Thesis';
import Profile from './components/User/Profile'
import { createStackNavigator } from '@react-navigation/stack';
import Logout from './components/User/Logout';
import AddThesis from './components/Thesis/AddThesis';
import Committees from './components/Commitees/Commitees';
import CommiteesDetail from './components/Commitees/CommiteesDetail';
import AddCommittees from './components/Commitees/AddCommittees';
import Criteria from './components/Criteria/Criteria';

const Drawer = createDrawerNavigator();

const App = () => {

  const [user, dispatch] = useReducer(UserReducer, null);

  return (
    <MyContext.Provider value={[user, dispatch]}>
      <NavigationContainer >
        <Drawer.Navigator initialRouteName='Login' screenOptions={({ route }) => ({
          headerRight: () => {
            if (route.name === 'Login') {
              return null
            }
            return <Logout />
          },
        })}>
          {user === null ? <>
            <Drawer.Screen name='Login' component={Login}
              options=
              {
                {
                  title: 'Đăng nhập',
                  headerStyle: {
                    backgroundColor: '#afeeee',
                  },
                }
              } />
          </> : <>
            <Drawer.Screen name='Profile' component={Profile} options={{ title: 'Thông tin cá nhân'}}/>
            <Drawer.Screen name='Home' component={Home} options={{ title: 'Trang chủ' }} />
            <Drawer.Screen name="Thesis" component={Thesis} options={{ title: "Chi tiết khóa luận", drawerItemStyle: { display: "none" } }}/>
            {user.role === 'academic_manager' ? <>
              <Drawer.Screen name='AddThesis' component={AddThesis} options={{ title: 'Thêm khóa luận', drawerItemStyle: { display: "none" } }} />
              <Drawer.Screen name='Committees' component={Committees} options={{ title: 'Hội đồng' }} />
              <Drawer.Screen name="CommitteesDetail" component={CommiteesDetail} options={{ title: "Chi tiết Hội đồng", drawerItemStyle: { display: "none" } }} />
              <Drawer.Screen name='AddCommittees' component={AddCommittees} options={{ title: 'Thêm hội đồng mới', drawerItemStyle: { display: "none" } }} />
              <Drawer.Screen name='Criteria' component={Criteria} options={{ title: 'Các Tiêu Chí' }} />
            </> : <></>}
          </>}
        </Drawer.Navigator>
      </NavigationContainer>
    </MyContext.Provider>
  );
}

export default App;