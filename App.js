import React from 'react';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import * as firebase from 'firebase';

import LoginScreen from './Components/LoginScreen';
import ToDoList from './Components/TodoList';


export const firebaseConfig = {
    apiKey: 'AIzaSyDX7YRtGamYPzV53-41oSFm9mLTxuUoXWw',
    authDomain: 'todo-list-b73b0.firebaseapp.com',
    databaseURL: 'https://todo-list-b73b0.firebaseio.com',
    projectId: 'todo-list-b73b0',
    storageBucket: 'todo-list-b73b0.appspot.com',
    messagingSenderId: '734404352074',
    appId: '1:734404352074:web:6bbca6651fdded6d292eb3',
    measurementId: 'G-FTT213HPLT'
};

firebase.initializeApp(firebaseConfig);


firebase.auth().onAuthStateChanged((user) => {
    if (user != null) {
        console.log('We are authenticated now!');
    }
    // Do other things
});

const MainNavigator = createStackNavigator(
    {
        LoginScreen: LoginScreen,
        ToDoList: ToDoList,
    },
    {
        initialRouteName: 'LoginScreen',
        defaultNavigationOptions: {
            header: null
        },
    }
);

const AppContainer = createAppContainer(MainNavigator)

export default function App() {
    return (
        <AppContainer />
    )
}  