import firebase from 'firebase/compat/app';

export interface Clip {
  docId?: string;
  uid: string;
  displayName: string;
  title: string;
  fileName: string;
  url: string;
  screenShotUrl: string;
  screenShotFileName: string;
  timestamp: firebase.firestore.FieldValue;
}
