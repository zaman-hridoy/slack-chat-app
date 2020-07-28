import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyDz6UU_4tr60tt0_rDJk0464R0ddBxTQ5g",
    authDomain: "react-slack-1186d.firebaseapp.com",
    databaseURL: "https://react-slack-1186d.firebaseio.com",
    projectId: "react-slack-1186d",
    storageBucket: "react-slack-1186d.appspot.com",
    messagingSenderId: "1072909875941",
    appId: "1:1072909875941:web:47d060f7cacb9d4b3ab20c",
    measurementId: "G-DL3D90XX6X"
};

firebase.initializeApp(firebaseConfig);

export default firebase;