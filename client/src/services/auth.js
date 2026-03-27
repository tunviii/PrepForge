import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup
} from "firebase/auth";

import { auth, googleProvider } from "../firebase/firebase";

/* REGISTER */

export const registerUser = async ({ email, password }) => {

  try {

    const result = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    return {
      success: true,
      user: result.user
    };

  } catch (error) {

    if(error.code=="auth/email-already-in-use"){
      return{
        success: false,
        message: "Email already in use. Please login instead."
      };
    }

    return {
      success: false,
      message: "Signup failed. Please try again."
    };

  }

};

/* LOGIN */

export const loginUser = async (email, password) => {

  try {

    const result = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    return {
      success: true,
      user: result.user
    };

  } catch (error) {

    return {
      success: false,
      message: error.message
    };

  }

};



/* GOOGLE LOGIN */

export const loginWithGoogle = async () => {

  try {

    const result = await signInWithPopup(auth, googleProvider);

    return {
      success: true,
      user: result.user
    };

  } catch (error) {

    return {
      success: false,
      message: error.message
    };

  }

};

/* LOGOUT */

export const logoutUser = async () => {
  await signOut(auth);
};

/* CURRENT USER */

export const getCurrentUser = () => {
  return auth.currentUser;
};