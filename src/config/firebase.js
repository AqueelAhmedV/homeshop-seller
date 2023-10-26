const {firebase} = require('firebase');

const firebaseConfig = {
  apiKey: 'AIzaSyCCXCxWsS5KFXrnhfOBFCpevdU1AueY4No',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'kdshree-otp',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: '668537072123',
  appId: 'YOUR_APP_ID',
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}


// export { firebase }