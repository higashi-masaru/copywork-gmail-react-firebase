import * as firebase from 'firebase/app';
import 'firebase/auth';

const init = async (): Promise<void> => {
  const response = await fetch('/__/firebase/init.json');
  const json = await response.json();
  firebase.initializeApp(json);
};

const signIn = async (): Promise<{
  accessToken: string;
  displayName: string;
  photoUrl: string;
}> => {
  const auth = firebase.auth();
  await auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.addScope('https://mail.google.com/');
  const userCredential = await auth.signInWithPopup(provider);
  const displayName = userCredential.user?.displayName || '';
  const photoUrl = userCredential.user?.photoURL || '';
  const oAuthCredential = userCredential.credential as firebase.auth.OAuthCredential;
  const { accessToken = '' } = oAuthCredential;
  return { accessToken, displayName, photoUrl };
};

const signOut = (): Promise<void> => firebase.auth().signOut();

export default {
  init,
  signIn,
  signOut,
};
